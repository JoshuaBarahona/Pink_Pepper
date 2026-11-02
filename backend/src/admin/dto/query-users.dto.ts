import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Rol } from '../../generated/prisma/enums.js';

export const EMPLOYEE_ROLES: Rol[] = [Rol.COCINA, Rol.REPARTIDOR, Rol.GERENTE];

const normalizeRol = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const parseOptionalBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

const trimOptional = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'Filtrar usuarios por rol',
    enum: Rol,
    example: Rol.CLIENTE,
  })
  @IsOptional()
  @Transform(normalizeRol)
  @IsEnum(Rol, {
    message:
      'El filtro rol debe ser GERENTE, ADMIN, CLIENTE, REPARTIDOR o COCINA.',
  })
  rol?: Rol;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo (true) o inactivo (false)',
    example: true,
  })
  @IsOptional()
  @Transform(parseOptionalBoolean)
  @IsBoolean({ message: 'El filtro estado debe ser booleano (true o false).' })
  estado?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda parcial por nombre, apellido, correo o teléfono',
    example: 'pinkpepper.com',
  })
  @IsOptional()
  @Transform(trimOptional)
  @IsString({ message: 'El parámetro busqueda debe ser texto.' })
  busqueda?: string;
}

export class QueryEmployeesDto {
  @ApiPropertyOptional({
    description:
      'Filtrar empleados exclusivamente por rol operativo (COCINA, REPARTIDOR o GERENTE)',
    enum: EMPLOYEE_ROLES,
    example: Rol.COCINA,
  })
  @IsOptional()
  @Transform(normalizeRol)
  @IsIn(EMPLOYEE_ROLES, {
    message: 'El filtro rol de empleado debe ser COCINA, REPARTIDOR o GERENTE.',
  })
  rol?: Rol;

  @ApiPropertyOptional({
    description: 'Filtrar empleados activos (true) o inactivos (false)',
    example: true,
  })
  @IsOptional()
  @Transform(parseOptionalBoolean)
  @IsBoolean({ message: 'El filtro estado debe ser booleano (true o false).' })
  estado?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda parcial por nombre, apellido, correo o teléfono',
    example: 'cocina',
  })
  @IsOptional()
  @Transform(trimOptional)
  @IsString({ message: 'El parámetro busqueda debe ser texto.' })
  busqueda?: string;
}
