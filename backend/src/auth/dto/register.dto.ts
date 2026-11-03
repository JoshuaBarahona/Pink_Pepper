import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimCollapse = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @ApiProperty({
    description: 'Primer nombre del usuario (máximo 20 caracteres)',
    example: 'María',
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
    description: 'Segundo nombre del usuario (opcional, máximo 20 caracteres)',
    example: 'Fernanda',
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
    description: 'Primer apellido del usuario (máximo 20 caracteres)',
    example: 'López',
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
    description:
      'Segundo apellido del usuario (opcional, máximo 20 caracteres)',
    example: 'Díaz',
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
    description: 'Correo electrónico único del usuario',
    example: 'cliente@pinkpepper.com',
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
      'Contraseña de mínimo 8 caracteres con al menos un carácter especial',
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
    description:
      'Número telefónico de contacto (opcional, máximo 20 caracteres)',
    example: '8845-2210',
    maxLength: 20,
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'El teléfono debe ser texto.' })
  @MaxLength(20, {
    message: 'El teléfono no puede superar los 20 caracteres.',
  })
  telefono?: string;
}
