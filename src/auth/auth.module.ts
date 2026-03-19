import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { Player } from '../players/entities/player.entity/player.entity';
import { Admin } from '../admins/entities/admin.entity/admin.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'gsc_super_secret_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forFeature([Player, Admin]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
