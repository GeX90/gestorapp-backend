import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registrar un nuevo usuario
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Login de usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/refresh
   * Refrescar access token usando refresh token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async refreshTokens(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    const userId = req.user.userId;
    return this.authService.refreshTokens(userId, refreshTokenDto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Cerrar sesión (eliminar refresh token)
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }

  /**
   * GET /auth/profile
   * Obtener perfil del usuario autenticado
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    return this.authService.getProfile(userId);
  }
}
