import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../players/entities/player.entity/player.entity';
import {
  Admin,
  AdminStatus,
} from '../admins/entities/admin.entity/admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  // Player Login
  async loginPlayer(
    email: string,
    password: string,
  ): Promise<{ token: string; player: Partial<Player> }> {
    const player = await this.playersRepository.findOneBy({ email });
    if (!player) throw new UnauthorizedException('Invalid email or password');
    if (!player.isVerified)
      throw new UnauthorizedException('Please verify your email first');

    // Check password
    if (player.password) {
      const isMatch = await bcrypt.compare(password, player.password);
      if (!isMatch)
        throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: player.id,
      email: player.email,
      role: 'player',
      type: 'player',
    };

    const token = this.jwtService.sign(payload);
    return {
      token,
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        email: player.email,
        primaryPosition: player.primaryPosition,
        level: player.level,
      },
    };
  }

  // Field Manager Login
  async loginFieldManager(
    email: string,
    password: string,
  ): Promise<{ token: string; admin: Partial<Admin> }> {
    const admin = await this.adminsRepository.findOneBy({ email });
    if (!admin) throw new UnauthorizedException('Invalid email or password');
    if (!admin.isVerified)
      throw new UnauthorizedException('Please verify your email first');
    if (admin.status !== AdminStatus.APPROVED)
      throw new UnauthorizedException(
        'Your account is not approved yet by Main Admin',
      );

    // Check password
    if (admin.password) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    const token = this.jwtService.sign(payload);
    return {
      token,
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        fieldId: admin.fieldId,
      },
    };
  }
}
