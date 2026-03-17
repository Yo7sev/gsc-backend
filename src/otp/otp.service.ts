import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp, OtpType } from './entities/otp.entity/otp.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private createTransporter() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtp(email: string, type: OtpType): Promise<{ message: string }> {
    // Invalidate any existing OTPs for this email
    await this.otpRepository.update({ email, isUsed: false }, { isUsed: true });

    // Generate new OTP
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const otp = this.otpRepository.create({
      email,
      code,
      type,
      isUsed: false,
      expiresAt,
    });
    await this.otpRepository.save(otp);

    // Send email
    const transporter = this.createTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'GSC - Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">GSC Verification Code</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #1d4ed8; font-size: 48px; letter-spacing: 8px;">${code}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });

    return { message: `OTP sent to ${email}` };
  }

  async verifyOtp(
    email: string,
    code: string,
    type: OtpType,
  ): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { email, code, type, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otp) throw new BadRequestException('Invalid OTP code');
    if (new Date() > otp.expiresAt)
      throw new BadRequestException('OTP code has expired');

    // Mark OTP as used
    otp.isUsed = true;
    await this.otpRepository.save(otp);

    return true;
  }
}
