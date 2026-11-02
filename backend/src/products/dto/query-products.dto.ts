import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Categoria } from '../../generated/prisma/enums.js';

const normalizeCategoria = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const parseOptionalBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

export class QueryProductsDto {
  @ApiPropertyOptional({
    description: 'Filtrar productos por categoría',
    enum: Categoria,
  })
  @IsOptional()
  @Transform(normalizeCategoria)
  @IsEnum(Categoria, {
    message: 'La categoría debe ser HAMBURGUESAS, POLLO o BEBIDAS.',
  })
  categoria?: Categoria;

  @ApiPropertyOptional({
    description: 'Filtrar productos por id_categoria',
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
    description: 'Filtrar por estado exacto (true o false)',
    example: true,
  })
  @IsOptional()
  @Transform(parseOptionalBoolean)
  @IsBoolean({ message: 'El filtro estado debe ser booleano (true o false).' })
  estado?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir productos inactivos/desactivados en el listado',
    example: false,
  })
  @IsOptional()
  @Transform(parseOptionalBoolean)
  @IsBoolean({
    message: 'El parámetro includeInactive debe ser booleano (true o false).',
  })
  includeInactive?: boolean;
}
