import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Admin,
  AdminStatus,
  AdminRole,
} from './entities/admin.entity/admin.entity';
import { OtpService } from '../otp/otp.service';
import { OtpType } from '../otp/entities/otp.entity/otp.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    private otpService: OtpService,
  ) {}

  // Step 1: Field Manager registers → sends OTP
  async requestAccess(
    adminData: Partial<Admin>,
  ): Promise<{ message: string; adminId: number }> {
    // Check if email already exists
    const existing = await this.adminsRepository.findOneBy({
      email: adminData.email,
    });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const admin = this.adminsRepository.create({
      ...adminData,
      role: AdminRole.FIELD_MANAGER,
      status: AdminStatus.PENDING,
      isVerified: false,
    });
    const saved = await this.adminsRepository.save(admin);

    // Send OTP
    await this.otpService.sendOtp(adminData.email!, OtpType.FIELD_MANAGER);

    return {
      message: `OTP sent to ${adminData.email}. Please verify your email.`,
      adminId: saved.id,
    };
  }

  // Step 2: Verify OTP → email verified
  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    await this.otpService.verifyOtp(email, code, OtpType.FIELD_MANAGER);

    const admin = await this.adminsRepository.findOneBy({ email });
    if (!admin) throw new BadRequestException('Field Manager not found');

    admin.isVerified = true;
    await this.adminsRepository.save(admin);

    return { message: 'Email verified! Waiting for Main Admin approval.' };
  }

  // Main Admin sees all Field Managers
  async findAll(): Promise<Admin[]> {
    return this.adminsRepository.find({
      where: { role: AdminRole.FIELD_MANAGER },
    });
  }

  // Main Admin sees pending Field Managers
  async findPending(): Promise<Admin[]> {
    return this.adminsRepository.find({
      where: {
        role: AdminRole.FIELD_MANAGER,
        status: AdminStatus.PENDING,
      },
    });
  }

  // Main Admin approves Field Manager
  async approveFieldManager(id: number, mainAdminId: number): Promise<Admin> {
    const admin: Admin | null = await this.adminsRepository.findOneBy({ id });
    if (!admin) throw new NotFoundException('Field Manager not found');
    if (admin.status !== AdminStatus.PENDING)
      throw new ForbiddenException('Field Manager is not pending approval');

    admin.status = AdminStatus.APPROVED;
    admin.approvedBy = mainAdminId;
    return this.adminsRepository.save(admin);
  }

  // Main Admin rejects Field Manager
  async rejectFieldManager(id: number, mainAdminId: number): Promise<Admin> {
    const admin: Admin | null = await this.adminsRepository.findOneBy({ id });
    if (!admin) throw new NotFoundException('Field Manager not found');
    if (admin.status !== AdminStatus.PENDING)
      throw new ForbiddenException('Field Manager is not pending approval');

    admin.status = AdminStatus.REJECTED;
    admin.approvedBy = mainAdminId;
    return this.adminsRepository.save(admin);
  }

  // Assign field to Field Manager
  async assignField(managerId: number, fieldId: number): Promise<Admin> {
    const admin: Admin | null = await this.adminsRepository.findOneBy({
      id: managerId,
    });
    if (!admin) throw new NotFoundException('Field Manager not found');
    if (admin.status !== AdminStatus.APPROVED)
      throw new ForbiddenException('Field Manager is not approved yet');

    admin.fieldId = fieldId;
    return this.adminsRepository.save(admin);
  }

  // Get Field Manager by field ID
  async findByField(fieldId: number): Promise<Admin | null> {
    return this.adminsRepository.findOneBy({ fieldId });
  }
}
