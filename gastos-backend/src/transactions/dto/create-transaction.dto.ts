import { IsNotEmpty, IsNumber, IsPositive, IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'El monto es requerido' })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  amount: number;

  @IsNotEmpty({ message: 'La fecha es requerida' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  date: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(500, { message: 'La descripción no puede superar 500 caracteres' })
  description?: string;

  @IsNotEmpty({ message: 'La categoría es requerida' })
  @IsString({ message: 'El ID de categoría debe ser texto' })
  categoryId: string;
}
