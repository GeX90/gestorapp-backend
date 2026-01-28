import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterTransactionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  month?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000, { message: 'El año debe ser mayor a 2000' })
  @Max(2100, { message: 'El año debe ser menor a 2100' })
  year?: number;
}
