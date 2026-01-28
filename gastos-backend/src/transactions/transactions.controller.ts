import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * POST /transactions
   * Crear una nueva transacción
   */
  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.userId;
    return this.transactionsService.create(userId, createTransactionDto);
  }

  /**
   * GET /transactions
   * Obtener todas las transacciones con filtros opcionales
   * Query params: month (1-12), year (2000-2100)
   */
  @Get()
  findAll(@Request() req, @Query() filters: FilterTransactionDto) {
    const userId = req.user.userId;
    return this.transactionsService.findAll(userId, filters);
  }

  /**
   * GET /transactions/stats
   * Obtener estadísticas de transacciones
   * Query params: month, year (opcionales)
   */
  @Get('stats')
  getStats(
    @Request() req,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const userId = req.user.userId;
    const monthNum = month ? parseInt(month, 10) : undefined;
    const yearNum = year ? parseInt(year, 10) : undefined;
    return this.transactionsService.getStats(userId, monthNum, yearNum);
  }

  /**
   * GET /transactions/:id
   * Obtener una transacción específica por ID
   */
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.transactionsService.findOne(id, userId);
  }

  /**
   * PATCH /transactions/:id
   * Actualizar una transacción
   */
  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    const userId = req.user.userId;
    return this.transactionsService.update(id, userId, updateTransactionDto);
  }

  /**
   * DELETE /transactions/:id
   * Eliminar una transacción
   */
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.transactionsService.remove(id, userId);
  }
}
