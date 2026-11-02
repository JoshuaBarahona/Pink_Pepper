import { ApiPropertyOptional } from '@nestjs/swagger';
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
} from 'class-validator';
import { Categoria } from '../../generated/prisma/enums.js';

const trimCollapse = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const normalizeCategoria = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre del producto (máximo 50 caracteres)',
    example: 'Groovie Burger Especial',
    maxLength: 50,
  })
  @IsOptional()
  @Transform(trimCollapse)
  @IsString({ message: 'El nombre del producto debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre del producto no puede estar vacío.' })
  @MaxLength(50, {
    message: 'El nombre del producto no puede superar los 50 caracteres.',
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción del producto (máximo 50 caracteres)',
    example: 'Doble carne con tocino ahumado',
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
    description: 'Nueva URL de imagen del producto',
    example: '/images/Groovie.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'La URL de la imagen debe ser texto.' })
  @MaxLength(255, {
    message: 'La URL de la imagen no puede superar los 255 caracteres.',
  })
  imagen_url?: string;

  @ApiPropertyOptional({
    description: 'Nuevo precio del producto (mayor a 0)',
    example: 380,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número válido con hasta 2 decimales.' },
  )
  @IsPositive({ message: 'El precio debe ser mayor que cero.' })
  precio?: number;

  @ApiPropertyOptional({
    description: 'Categoría del producto por nombre enum',
    enum: Categoria,
    example: Categoria.HAMBURGUESAS,
  })
  @IsOptional()
  @Transform(normalizeCategoria)
  @IsEnum(Categoria, {
    message: 'La categoría debe ser HAMBURGUESAS, POLLO o BEBIDAS.',
  })
  categoria?: Categoria;

  @ApiPropertyOptional({
    description: 'Identificador numérico de la categoría',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El identificador de categoría debe ser un número entero.',
  })
  @Min(1, { message: 'El identificador de categoría debe ser mayor a cero.' })
  id_categoria?: number;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo del producto',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  estado?: boolean;
}
