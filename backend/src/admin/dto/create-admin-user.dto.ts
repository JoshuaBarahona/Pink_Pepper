import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Rol } from '../../generated/prisma/enums.js';

const trimCollapse = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const normalizeRol = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateAdminUserDto {
  @ApiProperty({
    description: 'Primer nombre del usuario o empleado (máximo 20 caracteres)',
    example: 'Carlos',
    maxLength: 20,
  })
  @Transform(trimCollapse)
  @IsString({ message: 'El primer nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El primer nombre es obligatorio.' })
  @MaxLength(20, {
    message: 'El primer nombre no puede superar los 20 caracteres.',
  })
  primer_nombre!: string;

  @ApiPropertyOptional({
    description: 'Segundo nombre opcional (máximo 20 caracteres)',
    example: 'Eduardo',
    maxLength: 20,
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'El segundo nombre debe ser texto.' })
  @MaxLength(20, {
    message: 'El segundo nombre no puede superar los 20 caracteres.',
  })
  segundo_nombre?: string;

  @ApiProperty({
    description:
      'Primer apellido del usuario o empleado (máximo 20 caracteres)',
    example: 'Mendoza',
    maxLength: 20,
  })
  @Transform(trimCollapse)
  @IsString({ message: 'El primer apellido debe ser texto.' })
  @IsNotEmpty({ message: 'El primer apellido es obligatorio.' })
  @MaxLength(20, {
    message: 'El primer apellido no puede superar los 20 caracteres.',
  })
  primer_apellido!: string;

  @ApiPropertyOptional({
    description: 'Segundo apellido opcional (máximo 20 caracteres)',
    example: 'Rivas',
    maxLength: 20,
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'El segundo apellido debe ser texto.' })
  @MaxLength(20, {
    message: 'El segundo apellido no puede superar los 20 caracteres.',
  })
  segundo_apellido?: string;

  @ApiProperty({
    description: 'Correo electrónico único de acceso (máximo 50 caracteres)',
    example: 'cocina4@pinkpepper.com',
    maxLength: 50,
  })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido.' })
  @MaxLength(50, {
    message: 'El correo electrónico no puede superar los 50 caracteres.',
  })
  correo!: string;

  @ApiProperty({
    description:
      'Contraseña inicial (mínimo 8 caracteres, máximo 72 y al menos un carácter especial)',
    example: 'PinkPepper!2026',
    minLength: 8,
    maxLength: 72,
  })
  @IsString({ message: 'La contraseña debe ser texto.' })
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres.',
  })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres.',
  })
  @Matches(/[^A-Za-z0-9\s]/, {
    message:
      'La contraseña debe incluir al menos un carácter especial, como @, # o !.',
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto (máximo 20 caracteres)',
    example: '7012-3456',
    maxLength: 20,
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'El teléfono debe ser texto.' })
  @MaxLength(20, {
    message: 'El teléfono no puede superar los 20 caracteres.',
  })
  telefono?: string;

  @ApiProperty({
    description: 'Rol asignado al usuario',
    enum: Rol,
    example: Rol.COCINA,
  })
  @Transform(normalizeRol)
  @IsEnum(Rol, {
    message: 'El rol debe ser GERENTE, ADMIN, CLIENTE, REPARTIDOR o COCINA.',
  })
  rol!: Rol;

  @ApiPropertyOptional({
    description: 'Estado inicial del usuario (por defecto true)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  estado?: boolean;
}
