import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Rol } from '../generated/prisma/enums.js';
import type { Prisma, Usuario, rol_ } from '../generated/prisma/client.js';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import {
  EMPLOYEE_ROLES,
  QueryEmployeesDto,
  QueryUsersDto,
} from './dto/query-users.dto.js';

const SALT_ROUNDS = 10;

type UsuarioConRol = Usuario & {
  rol_: rol_ | null;
};

export interface AdminUserResponse {
  id_usuario: number;
  id_rol: number;
  rol: Rol;
  nombre_completo: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  estado: boolean;
  fecha_registro: Date;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve la lista de empleados del local: cocineros (COCINA),
   * repartidores (REPARTIDOR) y gerentes (GERENTE).
   */
  async findEmployees(
    query: QueryEmployeesDto = {},
  ): Promise<AdminUserResponse[]> {
    const where: Prisma.UsuarioWhereInput = {
      rol_: {
        nombre_rol:
          query.rol !== undefined ? query.rol : { in: EMPLOYEE_ROLES },
      },
    };

    if (query.estado !== undefined) {
      where.estado = query.estado;
    }

    this.applySearchFilter(where, query.busqueda);

    const empleados = await this.prisma.usuario.findMany({
      where,
      include: { rol_: true },
      orderBy: { id_usuario: 'asc' },
    });

    return empleados.map((emp) => this.sanitizeUser(emp));
  }

  async findAllUsers(query: QueryUsersDto = {}): Promise<AdminUserResponse[]> {
    const where: Prisma.UsuarioWhereInput = {};

    if (query.rol !== undefined) {
      where.rol_ = {
        nombre_rol: query.rol,
      };
    }

    if (query.estado !== undefined) {
      where.estado = query.estado;
    }

    this.applySearchFilter(where, query.busqueda);

    const usuarios = await this.prisma.usuario.findMany({
      where,
      include: { rol_: true },
      orderBy: { id_usuario: 'asc' },
    });

    return usuarios.map((u) => this.sanitizeUser(u));
  }

  async findOneUser(id: number): Promise<AdminUserResponse> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol_: true },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    return this.sanitizeUser(usuario);
  }

  async createUser(dto: CreateAdminUserDto): Promise<AdminUserResponse> {
    const correoNormalizado = dto.correo.trim().toLowerCase();

    const existing = await this.prisma.usuario.findFirst({
      where: {
        correo: {
          equals: correoNormalizado,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Este correo electrónico ya está registrado por otro usuario.',
      );
    }

    const idRol = await this.resolveRoleId(dto.rol);
    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const creado = await this.prisma.usuario.create({
      data: {
        id_rol: idRol,
        primer_nombre: dto.primer_nombre,
        segundo_nombre: dto.segundo_nombre ?? '',
        primer_apellido: dto.primer_apellido,
        segundo_apellido: dto.segundo_apellido ?? '',
        correo: correoNormalizado,
        password: hashedPassword,
        telefono: dto.telefono ?? '',
        estado: dto.estado ?? true,
        fecha_registro: new Date(),
      },
      include: { rol_: true },
    });

    return this.sanitizeUser(creado);
  }

  async updateUser(
    id: number,
    dto: UpdateAdminUserDto,
    currentAdminId: number,
  ): Promise<AdminUserResponse> {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!usuarioActual) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    if (id === currentAdminId) {
      if (dto.estado === false) {
        throw new BadRequestException(
          'No puedes desactivar tu propia cuenta de administrador.',
        );
      }
      if (dto.rol !== undefined && dto.rol !== Rol.ADMIN) {
        throw new BadRequestException(
          'No puedes quitarte el rol de administrador a ti mismo.',
        );
      }
    }

    const data: Prisma.UsuarioUncheckedUpdateInput = {};

    if (dto.correo !== undefined) {
      const correoNormalizado = dto.correo.trim().toLowerCase();
      const duplicate = await this.prisma.usuario.findFirst({
        where: {
          id_usuario: { not: id },
          correo: {
            equals: correoNormalizado,
            mode: 'insensitive',
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Este correo electrónico ya está registrado por otro usuario.',
        );
      }

      data.correo = correoNormalizado;
    }

    if (dto.rol !== undefined) {
      data.id_rol = await this.resolveRoleId(dto.rol);
    }

    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    if (dto.primer_nombre !== undefined) {
      data.primer_nombre = dto.primer_nombre;
    }

    if (dto.segundo_nombre !== undefined) {
      data.segundo_nombre = dto.segundo_nombre;
    }

    if (dto.primer_apellido !== undefined) {
      data.primer_apellido = dto.primer_apellido;
    }

    if (dto.segundo_apellido !== undefined) {
      data.segundo_apellido = dto.segundo_apellido;
    }

    if (dto.telefono !== undefined) {
      data.telefono = dto.telefono;
    }

    if (dto.estado !== undefined) {
      data.estado = dto.estado;
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
      include: { rol_: true },
    });

    return this.sanitizeUser(actualizado);
  }

  async changeUserRole(
    id: number,
    dto: UpdateUserRoleDto,
    currentAdminId: number,
  ): Promise<AdminUserResponse> {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!usuarioActual) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    if (id === currentAdminId && dto.rol !== Rol.ADMIN) {
      throw new BadRequestException(
        'No puedes quitarte el rol de administrador a ti mismo.',
      );
    }

    const idRol = await this.resolveRoleId(dto.rol);

    const actualizado = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { id_rol: idRol },
      include: { rol_: true },
    });

    return this.sanitizeUser(actualizado);
  }

  async changeUserStatus(
    id: number,
    dto: UpdateUserStatusDto,
    currentAdminId: number,
  ): Promise<AdminUserResponse> {
    const usuarioActual = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });

    if (!usuarioActual) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    if (id === currentAdminId && !dto.estado) {
      throw new BadRequestException(
        'No puedes desactivar tu propia cuenta de administrador.',
      );
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { estado: dto.estado },
      include: { rol_: true },
    });

    return this.sanitizeUser(actualizado);
  }

  /**
   * Eliminación lógica (soft delete): desactiva al usuario cambiando `estado` a `false`
   * sin borrar el registro físico de la base de datos.
   */
  async deactivateUser(
    id: number,
    currentAdminId: number,
  ): Promise<AdminUserResponse> {
    return this.changeUserStatus(id, { estado: false }, currentAdminId);
  }

  private async resolveRoleId(nombreRol: Rol): Promise<number> {
    let rolRow = await this.prisma.rol_.findFirst({
      where: { nombre_rol: nombreRol },
    });

    if (!rolRow) {
      rolRow = await this.prisma.rol_.create({
        data: { nombre_rol: nombreRol },
      });
    }

    return rolRow.id_rol;
  }

  private applySearchFilter(
    where: Prisma.UsuarioWhereInput,
    busqueda?: string,
  ): void {
    if (!busqueda) return;

    where.OR = [
      { primer_nombre: { contains: busqueda, mode: 'insensitive' } },
      { segundo_nombre: { contains: busqueda, mode: 'insensitive' } },
      { primer_apellido: { contains: busqueda, mode: 'insensitive' } },
      { segundo_apellido: { contains: busqueda, mode: 'insensitive' } },
      { correo: { contains: busqueda, mode: 'insensitive' } },
    ];
  }

  private sanitizeUser(usuario: UsuarioConRol): AdminUserResponse {
    const nombreCompleto = [
      usuario.primer_nombre,
      usuario.segundo_nombre,
      usuario.primer_apellido,
      usuario.segundo_apellido,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      rol: usuario.rol_?.nombre_rol ?? Rol.CLIENTE,
      nombre_completo: nombreCompleto,
      primer_nombre: usuario.primer_nombre,
      segundo_nombre: usuario.segundo_nombre,
      primer_apellido: usuario.primer_apellido,
      segundo_apellido: usuario.segundo_apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
      estado: usuario.estado,
      fecha_registro: usuario.fecha_registro,
    };
  }
}
