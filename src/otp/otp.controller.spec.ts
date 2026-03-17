import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpType } from './entities/otp.entity/otp.entity';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  // Send OTP to email
  @Post('send')
  sendOtp(
    @Body('email') email: string,
    @Body('type') type: OtpType,
  ): Promise<{ message: string }> {
    return this.otpService.sendOtp(email, type);
  }

  // Verify OTP code
  @Post('verify')
  verifyOtp(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('type') type: OtpType,
  ): Promise<boolean> {
    return this.otpService.verifyOtp(email, code, type);
  }
}
