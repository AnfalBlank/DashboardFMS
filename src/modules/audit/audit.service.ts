import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async logAudit(
    userId: string | null | undefined,
    action: string,
    module: string,
    recordId?: string | null,
    before?: unknown,
    after?: unknown,
    reason?: string | null,
    ip?: string | null,
  ): Promise<void> {
    try {
      const entry = this.auditLogRepo.create({
        id: uuid(),
        userId: userId ?? undefined,
        action,
        module,
        recordId: recordId ?? undefined,
        beforeVal: before ? JSON.stringify(before) : undefined,
        afterVal: after ? JSON.stringify(after) : undefined,
        reason: reason ?? undefined,
        ipAddress: ip ?? undefined,
      });

      await this.auditLogRepo.save(entry);
    } catch (err) {
      this.logger.error('Audit log error:', err);
    }
  }
}
