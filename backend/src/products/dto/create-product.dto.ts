import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Categoria } from '../../generated/prisma/enums.js';

const trimCollapse = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeCategoria = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre único del producto (máximo 50 caracteres)',
    example: 'Hamburguesa BBQ',
    maxLength: 50,
  })
  @Transform(trimCollapse)
  @IsString({ message: 'El nombre del producto debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio.' })
  @MaxLength(50, {
    message: 'El nombre del producto no puede superar los 50 caracteres.',
  })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción corta del platillo (máximo 50 caracteres)',
    example: 'Carne de res, cheddar y salsa BBQ',
    maxLength: 50,
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(50, {
    message: 'La descripción no puede superar los 50 caracteres.',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Ruta o URL de la imagen del producto',
    example: '/images/Clasica.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'La URL de la imagen debe ser texto.' })
  @MaxLength(255, {
    message: 'La URL de la imagen no puede superar los 255 caracteres.',
  })
  imagen_url?: string;

  @ApiProperty({
    description: 'Precio unitario del producto en córdobas (mayor a 0)',
    example: 290,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido con hasta 2 decimales.' },
  )
  @IsPositive({ message: 'El precio debe ser mayor que cero.' })
  precio: number;

  @ApiPropertyOptional({
    description:
      'Nombre de categoría del producto (obligatorio si no se envía id_categoria)',
    enum: Categoria,
    example: Categoria.HAMBURGUESAS,
  })
  @ValidateIf(
    (o: CreateProductDto) =>
      o.id_categoria === undefined || o.categoria !== undefined,
  )
  @Transform(normalizeCategoria)
  @IsEnum(Categoria, {
    message: 'La categoría debe ser HAMBURGUESAS, POLLO o BEBIDAS.',
  })
  categoria?: Categoria;

  @ApiPropertyOptional({
    description:
      'Identificador numérico de la categoría (obligatorio si no se envía categoria)',
    example: 1,
  })
  @ValidateIf(
    (o: CreateProductDto) =>
      o.categoria === undefined || o.id_categoria !== undefined,
  )
  @Type(() => Number)
  @IsInt({
    message: 'El identificador de categoría debe ser un número entero.',
  })
  @Min(1, { message: 'El identificador de categoría debe ser mayor a cero.' })
  id_categoria?: number;

  @ApiPropertyOptional({
    description: 'Disponibilidad inicial del producto (por defecto true)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  estado?: boolean;
}
