import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Admin,
  AdminStatus,
  AdminRole,
} from './entities/admin.entity/admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
  ) {}

  // Field Manager requests access
  async requestAccess(adminData: Partial<Admin>): Promise<Admin> {
    const admin = this.adminsRepository.create({
      ...adminData,
      role: AdminRole.FIELD_MANAGER,
      status: AdminStatus.PENDING,
    });
    return this.adminsRepository.save(admin);
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
