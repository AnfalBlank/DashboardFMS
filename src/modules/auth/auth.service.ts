import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly audit: AuditService,
  ) {}

  async login(loginDto: LoginDto, ip?: string) {
    const { username, password } = loginDto;

    const user = await this.userRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.role', 'r')
      .where('u.username = :username AND u.status = :status', {
        username,
        status: 'ACTIVE',
      })
      .getOne();

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Username atau password salah',
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException({
        success: false,
        message: 'Username atau password salah',
      });
    }

    await this.userRepo.update(user.id, {
      lastLogin: new Date(),
    });

    const payload: AuthUser = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      roleName: user.role?.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) ?? '8h',
    });

    await this.audit.logAudit(
      user.id,
      'LOGIN',
      'Auth',
      user.id,
      null,
      null,
      null,
      ip,
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role?.name,
        status: user.status,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.id = :userId', { userId })
      .getOne();

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role?.name,
      status: user.status,
      last_login: user.lastLogin,
    };
  }

  async logout(user: AuthUser, ip?: string) {
    await this.audit.logAudit(
      user.userId,
      'LOGOUT',
      'Auth',
      user.userId,
      null,
      null,
      null,
      ip,
    );
    return { message: 'Logout berhasil' };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    ip?: string,
  ) {
    const { currentPassword, newPassword } = dto;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException({
        success: false,
        message: 'currentPassword dan newPassword wajib diisi',
      });
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException({
        success: false,
        message: 'Password saat ini salah',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(userId, { password: hashed });

    await this.audit.logAudit(
      userId,
      'CHANGE_PASSWORD',
      'Auth',
      userId,
      null,
      null,
      null,
      ip,
    );

    return { message: 'Password berhasil diubah' };
  }
}
