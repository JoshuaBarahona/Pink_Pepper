import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titular!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  marca!: string;

  @IsString()
  @Matches(/^\d{4}$/)
  ultimos_digitos!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mes_expiracion!: number;

  @IsInt()
  @Min(new Date().getFullYear())
  anio_expiracion!: number;

  @IsOptional()
  @IsBoolean()
  es_principal?: boolean;
}