import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/usuario/dto/create-usuario.dto';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard';

interface LoginBody {
  username?: string;
  password?: string;
  captchaAnswer?: string;
  captchaToken?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.register(createUsuarioDto);
  }

  @Get('captcha')
  getCaptcha() {
    return this.authService.generateCaptcha();
  }

  @Post('login')
  async login(@Body() body: LoginBody, @Req() req: Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';
    const browser = req.headers['user-agent'] || 'unknown';

    return this.authService.login({
      username: body.username || '',
      password: body.password || '',
      captchaAnswer: body.captchaAnswer || '',
      captchaToken: body.captchaToken || '',
      ip,
      browser,
    });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request & { user?: any }) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown';
    const browser = req.headers['user-agent'] || 'unknown';
    const tokenInfo = req.user as { id?: number; username?: string } | null;

    return this.authService.logout(tokenInfo, ip, browser);
  }
}
