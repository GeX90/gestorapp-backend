import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  /**
   * POST /budgets - Crear nuevo presupuesto mensual
   */
  @Post()
  create(@Request() req, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.userId, createBudgetDto);
  }

  /**
   * GET /budgets - Listar todos los presupuestos del usuario
   */
  @Get()
  findAll(@Request() req) {
    return this.budgetsService.findAll(req.user.userId);
  }

  /**
   * GET /budgets/current - Obtener presupuesto del mes actual
   */
  @Get('current')
  findCurrent(@Request() req) {
    return this.budgetsService.findCurrent(req.user.userId);
  }

  /**
   * GET /budgets/:year/:month - Obtener presupuesto específico
   */
  @Get(':year/:month')
  findByMonthYear(
    @Request() req,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.budgetsService.findByMonthYear(req.user.userId, month, year);
  }

  /**
   * PATCH /budgets/:year/:month - Actualizar presupuesto
   */
  @Patch(':year/:month')
  update(
    @Request() req,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(
      req.user.userId,
      month,
      year,
      updateBudgetDto,
    );
  }

  /**
   * DELETE /budgets/:year/:month - Eliminar presupuesto
   */
  @Delete(':year/:month')
  remove(
    @Request() req,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.budgetsService.remove(req.user.userId, month, year);
  }
}
