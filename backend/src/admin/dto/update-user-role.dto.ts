import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Rol } from '../../generated/prisma/enums.js';

const normalizeRol = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Nuevo rol para el usuario',
    enum: Rol,
    example: Rol.REPARTIDOR,
  })
  @Transform(normalizeRol)
  @IsEnum(Rol, {
    message: 'El rol debe ser GERENTE, ADMIN, CLIENTE, REPARTIDOR o COCINA.',
  })
  rol!: Rol;
}
