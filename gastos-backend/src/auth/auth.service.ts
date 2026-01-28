import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registrar un nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        income: 0,
      },
    });

    // Crear categorías predefinidas para el nuevo usuario
    await this.createDefaultCategories(user.id);

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Guardar refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Guardar refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  /**
   * Refrescar access token usando refresh token
   */
  async refreshTokens(userId: string, refreshToken: string) {
    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    // Verificar refresh token
    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Acceso denegado');
    }

    // Generar nuevos tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Actualizar refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Logout - eliminar refresh token
   */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logout exitoso' };
  }

  /**
   * Generar access token y refresh token
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Guardar refresh token hasheado en la base de datos
   */
  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  /**
   * Crear categorías predefinidas para un nuevo usuario
   */
  private async createDefaultCategories(userId: string) {
    const defaultCategories = [
      // Categorías de ingresos
      { name: 'Salario', type: 'INCOME' as const },
      { name: 'Freelance', type: 'INCOME' as const },
      { name: 'Inversiones', type: 'INCOME' as const },
      { name: 'Otros ingresos', type: 'INCOME' as const },
      
      // Categorías de gastos
      { name: 'Alimentación', type: 'EXPENSE' as const },
      { name: 'Transporte', type: 'EXPENSE' as const },
      { name: 'Vivienda', type: 'EXPENSE' as const },
      { name: 'Servicios', type: 'EXPENSE' as const },
      { name: 'Entretenimiento', type: 'EXPENSE' as const },
      { name: 'Salud', type: 'EXPENSE' as const },
      { name: 'Educación', type: 'EXPENSE' as const },
      { name: 'Otros gastos', type: 'EXPENSE' as const },
    ];

    await this.prisma.category.createMany({
      data: defaultCategories.map(cat => ({
        ...cat,
        userId,
      })),
    });
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        income: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }
}
