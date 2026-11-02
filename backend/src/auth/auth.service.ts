import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Rol } from '../generated/prisma/enums.js';
import type { Usuario, rol_ } from '../generated/prisma/client.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

const SALT_ROUNDS = 10;

type UsuarioConRol = Usuario & {
  rol_: rol_ | null;
};

export interface AuthUserResponse {
  id_usuario: number;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  estado: boolean;
  fecha_registro: Date;
  rol: Rol;
}

export interface AuthResponse {
  access_token: string;
  usuario: AuthUserResponse;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const correoNormalizado = dto.correo.trim().toLowerCase();

    const existingUser = await this.prisma.usuario.findFirst({
      where: { correo: correoNormalizado },
    });

    if (existingUser) {
      throw new ConflictException(
        'Este correo electrónico ya está registrado.',
      );
    }

    // Busca el rol CLIENTE o lo inicializa si la tabla aún está vacía
    let rolCliente = await this.prisma.rol_.findFirst({
      where: { nombre_rol: Rol.CLIENTE },
    });

    if (!rolCliente) {
      rolCliente = await this.prisma.rol_.create({
        data: { nombre_rol: Rol.CLIENTE },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        id_rol: rolCliente.id_rol,
        primer_nombre: dto.primer_nombre,
        segundo_nombre: dto.segundo_nombre ?? '',
        primer_apellido: dto.primer_apellido,
        segundo_apellido: dto.segundo_apellido ?? '',
        correo: correoNormalizado,
        password: hashedPassword,
        telefono: dto.telefono ?? '',
        estado: true,
        fecha_registro: new Date(),
      },
      include: {
        rol_: true,
      },
    });

    return this.buildAuthResponse(nuevoUsuario);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const correoNormalizado = dto.correo.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findFirst({
      where: { correo: correoNormalizado },
      include: { rol_: true },
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'El correo electrónico o la contraseña son incorrectos.',
      );
    }

    if (!usuario.estado) {
      throw new ForbiddenException('Esta cuenta se encuentra deshabilitada.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      usuario.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'El correo electrónico o la contraseña son incorrectos.',
      );
    }

    return this.buildAuthResponse(usuario);
  }

  async getProfile(userId: number): Promise<AuthUserResponse> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: userId },
      include: { rol_: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!usuario.estado) {
      throw new ForbiddenException('Esta cuenta se encuentra deshabilitada.');
    }

    return this.sanitizeUsuario(usuario);
  }

  private async buildAuthResponse(
    usuario: UsuarioConRol,
  ): Promise<AuthResponse> {
    const safeUser = this.sanitizeUsuario(usuario);

    const payload: JwtPayload = {
      sub: safeUser.id_usuario,
      correo: safeUser.correo,
      rol: safeUser.rol,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      usuario: safeUser,
    };
  }

  private sanitizeUsuario(usuario: UsuarioConRol): AuthUserResponse {
    return {
      id_usuario: usuario.id_usuario,
      primer_nombre: usuario.primer_nombre,
      segundo_nombre: usuario.segundo_nombre,
      primer_apellido: usuario.primer_apellido,
      segundo_apellido: usuario.segundo_apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
      estado: usuario.estado,
      fecha_registro: usuario.fecha_registro,
      rol: usuario.rol_?.nombre_rol ?? Rol.CLIENTE,
    };
  }
}
