import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.create(registerDto);
  }

  @Post('sign-in')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
