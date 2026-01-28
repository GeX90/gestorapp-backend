import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateBudgetDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2000)
  year: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  alertAt?: number = 80; // Por defecto 80%
}
