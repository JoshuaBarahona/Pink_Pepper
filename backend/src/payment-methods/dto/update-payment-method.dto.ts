import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePaymentMethodDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titular?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  marca?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/)
  ultimos_digitos?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mes_expiracion?: number;

  @IsOptional()
  @IsInt()
  @Min(new Date().getFullYear())
  anio_expiracion?: number;
}
