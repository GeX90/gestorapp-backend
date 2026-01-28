import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva transacción para el usuario autenticado
   */
  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    // Verificar que la categoría existe y pertenece al usuario
    const category = await this.prisma.category.findUnique({
      where: { id: createTransactionDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para usar esta categoría');
    }

    // Crear la transacción
    return this.prisma.transaction.create({
      data: {
        amount: createTransactionDto.amount,
        date: new Date(createTransactionDto.date),
        description: createTransactionDto.description,
        userId,
        categoryId: createTransactionDto.categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  /**
   * Obtener todas las transacciones del usuario con filtros opcionales
   */
  async findAll(userId: string, filters?: FilterTransactionDto) {
    const whereClause: any = { userId };

    // Aplicar filtros de mes y año si se proporcionan
    if (filters?.month || filters?.year) {
      whereClause.date = {};

      if (filters.month && filters.year) {
        // Filtrar por mes y año específicos
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
        
        whereClause.date.gte = startDate;
        whereClause.date.lte = endDate;
      } else if (filters.year) {
        // Solo filtrar por año
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999);
        
        whereClause.date.gte = startDate;
        whereClause.date.lte = endDate;
      } else if (filters.month) {
        throw new BadRequestException('Si proporcionas un mes, debes proporcionar también el año');
      }
    }

    return this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Obtener una transacción específica del usuario
   */
  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a esta transacción');
    }

    return transaction;
  }

  /**
   * Actualizar una transacción del usuario
   */
  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto) {
    // Verificar que la transacción existe y pertenece al usuario
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar esta transacción');
    }

    // Si se actualiza la categoría, verificar que existe y pertenece al usuario
    if (updateTransactionDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateTransactionDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }

      if (category.userId !== userId) {
        throw new ForbiddenException('No tienes permiso para usar esta categoría');
      }
    }

    // Actualizar la transacción
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(updateTransactionDto.amount && { amount: updateTransactionDto.amount }),
        ...(updateTransactionDto.date && { date: new Date(updateTransactionDto.date) }),
        ...(updateTransactionDto.description !== undefined && { description: updateTransactionDto.description }),
        ...(updateTransactionDto.categoryId && { categoryId: updateTransactionDto.categoryId }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar una transacción del usuario
   */
  async remove(id: string, userId: string) {
    // Verificar que la transacción existe y pertenece al usuario
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta transacción');
    }

    // Eliminar la transacción
    await this.prisma.transaction.delete({
      where: { id },
    });

    return { message: 'Transacción eliminada exitosamente' };
  }

  /**
   * Obtener estadísticas de transacciones del usuario
   */
  async getStats(userId: string, month?: number, year?: number) {
    const whereClause: any = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
      },
    });

    const totalIncome = transactions
      .filter(t => t.category.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.category.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  }

  /**
   * Exportar transacciones de un mes específico a CSV
   */
  async exportToCSV(userId: string, month: number, year: number): Promise<string> {
    if (!month || !year) {
      throw new BadRequestException('Debes proporcionar mes y año');
    }

    if (month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    // Obtener transacciones del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (transactions.length === 0) {
      throw new NotFoundException(`No hay transacciones para ${month}/${year}`);
    }

    // Generar CSV
    const headers = ['Fecha', 'Categoría', 'Tipo', 'Monto', 'Descripción'];
    const csvRows = [headers.join(',')];

    for (const transaction of transactions) {
      const row = [
        this.formatDate(transaction.date),
        this.escapeCSV(transaction.category.name),
        transaction.category.type,
        transaction.amount.toFixed(2),
        this.escapeCSV(transaction.description || ''),
      ];
      csvRows.push(row.join(','));
    }

    // Agregar totales al final
    const totalIncome = transactions
      .filter(t => t.category.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.category.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    csvRows.push(''); // Línea vacía
    csvRows.push('RESUMEN');
    csvRows.push(`Total Ingresos,,INCOME,${totalIncome.toFixed(2)}`);
    csvRows.push(`Total Gastos,,EXPENSE,${totalExpense.toFixed(2)}`);
    csvRows.push(`Balance,,,${(totalIncome - totalExpense).toFixed(2)}`);

    return csvRows.join('\n');
  }

  /**
   * Formatear fecha para CSV
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  /**
   * Escapar valores para CSV (manejar comas y comillas)
   */
  private escapeCSV(value: string): string {
    if (!value) return '';
    
    // Si contiene coma, comilla o salto de línea, envolver en comillas
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // Duplicar comillas dentro del valor
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }
}
