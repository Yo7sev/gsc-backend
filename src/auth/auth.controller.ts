import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Player Login
  @Post('login/player')
  loginPlayer(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.loginPlayer(email, password);
  }

  // Field Manager Login
  @Post('login/field-manager')
  loginFieldManager(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.loginFieldManager(email, password);
  }
}
