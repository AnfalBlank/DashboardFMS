import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditLog,
  Approval,
  SystemSetting,
  Notification,
  Transaction,
} from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import { toNum } from '../../common/utils/db.util';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(Approval)
    private readonly approvalRepo: Repository<Approval>,
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    private readonly audit: AuditService,
  ) {}

  // ── Audit Log ──
  async getAuditLogs(
    module?: string,
    userId?: string,
    from?: string,
    to?: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const qb = this.auditLogRepo
      .createQueryBuilder('al')
      .leftJoinAndSelect('al.user', 'u');

    if (module) {
      qb.andWhere('al.module = :module', { module });
    }
    if (userId) {
      qb.andWhere('al.userId = :userId', { userId });
    }
    if (from) {
      qb.andWhere('al.createdAt >= :from', { from });
    }
    if (to) {
      qb.andWhere('al.createdAt <= :to', { to: to + ' 23:59:59' });
    }

    qb.orderBy('al.createdAt', 'DESC')
      .take(Number(limit))
      .skip(Number(offset));

    const [rows, total] = await qb.getManyAndCount();

    const data = rows.map((al) => ({
      id: al.id,
      user_id: al.userId,
      username: al.user?.username,
      user_name: al.user?.name,
      action: al.action,
      module: al.module,
      record_id: al.recordId,
      before_val: al.beforeVal,
      after_val: al.afterVal,
      reason: al.reason,
      ip_address: al.ipAddress,
      created_at: al.createdAt,
    }));

    return { data, meta: { total } };
  }

  // ── Approvals ──
  async getApprovals(status: string = 'PENDING') {
    const list = await this.approvalRepo
      .createQueryBuilder('a')
      .innerJoinAndSelect('a.requester', 'u')
      .leftJoinAndSelect('a.reviewer', 'r')
      .where('a.status = :status', { status })
      .orderBy('a.requestedAt', 'DESC')
      .getMany();

    return list.map((a) => ({
      id: a.id,
      type: a.type,
      ref_table: a.refTable,
      ref_id: a.refId,
      detail: a.detail,
      status: a.status,
      requested_by: a.requestedBy,
      requested_by_name: a.requester?.username,
      reviewed_by: a.reviewedBy,
      reviewed_by_name: a.reviewer?.username,
      review_note: a.reviewNote,
      requested_at: a.requestedAt,
      reviewed_at: a.reviewedAt,
    }));
  }

  async approve(id: string, note?: string, userId?: string, ip?: string) {
    const apv = await this.approvalRepo.findOneBy({ id });
    if (!apv) {
      throw new NotFoundException({
        success: false,
        message: 'Approval request tidak ditemukan',
      });
    }

    await this.approvalRepo.update(id, {
      status: 'APPROVED',
      reviewedBy: userId,
      reviewNote: note ?? undefined,
      reviewedAt: new Date(),
    });

    await this.audit.logAudit(
      userId,
      'APPROVE',
      'Approval',
      id,
      { status: 'PENDING' },
      { status: 'APPROVED' },
      note,
      ip,
    );

    return { message: 'Disetujui' };
  }

  async reject(id: string, note: string, userId?: string, ip?: string) {
    if (!note) {
      throw new BadRequestException({
        success: false,
        message: 'Alasan penolakan wajib diisi',
      });
    }

    const apv = await this.approvalRepo.findOneBy({ id });
    if (!apv) {
      throw new NotFoundException({
        success: false,
        message: 'Approval request tidak ditemukan',
      });
    }

    await this.approvalRepo.update(id, {
      status: 'REJECTED',
      reviewedBy: userId,
      reviewNote: note,
      reviewedAt: new Date(),
    });

    await this.audit.logAudit(
      userId,
      'REJECT',
      'Approval',
      id,
      { status: 'PENDING' },
      { status: 'REJECTED' },
      note,
      ip,
    );

    return { message: 'Ditolak' };
  }

  // ── System Settings ──
  async getSettings() {
    const rows = await this.settingRepo.find({ order: { key: 'ASC' } });
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }

  async updateSettings(
    updates: Record<string, string>,
    userId?: string,
    ip?: string,
  ) {
    for (const [key, value] of Object.entries(updates)) {
      const setting = this.settingRepo.create({
        key,
        value: String(value),
        updatedBy: userId ?? undefined,
      });
      await this.settingRepo.save(setting);
    }

    await this.audit.logAudit(
      userId,
      'UPDATE_SETTINGS',
      'System',
      'system_settings',
      null,
      updates,
      null,
      ip,
    );

    return { message: 'Pengaturan disimpan' };
  }

  // ── Notifications ──
  async getNotifications() {
    return this.notificationRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async readAllNotifications() {
    await this.notificationRepo.update({}, { read: 1 });
    return { success: true };
  }

  // ── Integration Monitor ──
  async getIntegrationStatus() {
    const [totalRaw, todayCount] = await Promise.all([
      this.txRepo
        .createQueryBuilder('t')
        .select('COUNT(*)', 'total')
        .addSelect('SUM(CASE WHEN t.synced = 1 THEN 1 ELSE 0 END)', 'synced')
        .getRawOne(),
      this.txRepo
        .createQueryBuilder('t')
        .where('DATE(t.createdAt) = CURDATE()')
        .getCount(),
    ]);

    return {
      total_received: toNum(totalRaw?.total),
      synced: toNum(totalRaw?.synced),
      pending: 0,
      failed: 0,
      today: todayCount,
      last_sync: new Date().toISOString(),
    };
  }
}
