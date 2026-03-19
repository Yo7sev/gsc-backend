import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity/player.entity';
import { OtpService } from '../otp/otp.service';
import { OtpType } from '../otp/entities/otp.entity/otp.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    private otpService: OtpService,
  ) {}

  // Step 1: Register player and send OTP
  async register(
    playerData: Partial<Player> & { password?: string },
  ): Promise<{ message: string; playerId: number }> {
    // Check if email already exists
    const existing = await this.playersRepository.findOneBy({
      email: playerData.email,
    });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (playerData.password) {
      hashedPassword = await bcrypt.hash(playerData.password, 10);
    }

    // Create player as unverified
    const player = this.playersRepository.create({
      ...playerData,
      password: hashedPassword,
      isVerified: false,
    });
    const saved = await this.playersRepository.save(player);

    // Send OTP
    await this.otpService.sendOtp(playerData.email!, OtpType.PLAYER);

    return {
      message: `OTP sent to ${playerData.email}. Please verify your account.`,
      playerId: saved.id,
    };
  }

  // Step 2: Verify OTP
  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    await this.otpService.verifyOtp(email, code, OtpType.PLAYER);

    const player = await this.playersRepository.findOneBy({ email });
    if (!player) throw new BadRequestException('Player not found');

    player.isVerified = true;
    await this.playersRepository.save(player);

    return { message: 'Email verified successfully! You can now login.' };
  }

  async findAll(): Promise<Player[]> {
    return this.playersRepository.find();
  }

  async findOne(id: number): Promise<Player | null> {
    return this.playersRepository.findOneBy({ id });
  }

  async create(playerData: Partial<Player>): Promise<Player> {
    const player = this.playersRepository.create(playerData);
    return this.playersRepository.save(player);
  }

  async update(
    id: number,
    playerData: Partial<Player>,
  ): Promise<Player | null> {
    await this.playersRepository.update(id, playerData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.playersRepository.delete(id);
  }
}
