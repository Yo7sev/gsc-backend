import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { Admin } from './entities/admin.entity/admin.entity';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  // Field Manager requests access
  @Post('request')
  requestAccess(@Body() adminData: Partial<Admin>): Promise<Admin> {
    return this.adminsService.requestAccess(adminData);
  }

  // Main Admin sees all Field Managers
  @Get()
  findAll(): Promise<Admin[]> {
    return this.adminsService.findAll();
  }

  // Main Admin sees pending Field Managers
  @Get('pending')
  findPending(): Promise<Admin[]> {
    return this.adminsService.findPending();
  }

  // Main Admin approves Field Manager
  @Patch(':id/approve')
  approveFieldManager(
    @Param('id') id: number,
    @Body('mainAdminId') mainAdminId: number,
  ): Promise<Admin> {
    return this.adminsService.approveFieldManager(id, mainAdminId);
  }

  // Main Admin rejects Field Manager
  @Patch(':id/reject')
  rejectFieldManager(
    @Param('id') id: number,
    @Body('mainAdminId') mainAdminId: number,
  ): Promise<Admin> {
    return this.adminsService.rejectFieldManager(id, mainAdminId);
  }

  // Assign field to Field Manager
  @Patch(':id/assign-field')
  assignField(
    @Param('id') id: number,
    @Body('fieldId') fieldId: number,
  ): Promise<Admin> {
    return this.adminsService.assignField(id, fieldId);
  }

  // Get Field Manager by field ID
  @Get('field/:fieldId')
  findByField(@Param('fieldId') fieldId: number): Promise<Admin | null> {
    return this.adminsService.findByField(fieldId);
  }
}
