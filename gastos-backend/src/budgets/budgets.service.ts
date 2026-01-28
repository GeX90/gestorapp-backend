import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo presupuesto mensual para el usuario
   */
  async create(userId: string, createBudgetDto: CreateBudgetDto) {
    const { month, year, amount, alertAt } = createBudgetDto;

    // Verificar si ya existe un presupuesto para ese mes/año
    const existingBudget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (existingBudget) {
      throw new ConflictException(
        `Ya existe un presupuesto para ${month}/${year}`,
      );
    }

    const budget = await this.prisma.budget.create({
      data: {
        userId,
        month,
        year,
        amount,
        alertAt: alertAt ?? 80,
      },
    });

    // Calcular el gasto actual y verificar alerta
    return this.addSpentInfo(budget, userId);
  }

  /**
   * Obtener todos los presupuestos del usuario
   */
  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return Promise.all(
      budgets.map((budget) => this.addSpentInfo(budget, userId)),
    );
  }

  /**
   * Obtener presupuesto del mes actual
   */
  async findCurrent(userId: string) {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(
        `No hay presupuesto configurado para ${month}/${year}`,
      );
    }

    return this.addSpentInfo(budget, userId);
  }

  /**
   * Obtener presupuesto por mes y año específicos
   */
  async findByMonthYear(userId: string, month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(
        `No hay presupuesto para ${month}/${year}`,
      );
    }

    return this.addSpentInfo(budget, userId);
  }

  /**
   * Actualizar presupuesto existente
   */
  async update(
    userId: string,
    month: number,
    year: number,
    updateBudgetDto: UpdateBudgetDto,
  ) {
    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(
        `No existe presupuesto para ${month}/${year}`,
      );
    }

    const updated = await this.prisma.budget.update({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      data: updateBudgetDto,
    });

    return this.addSpentInfo(updated, userId);
  }

  /**
   * Eliminar presupuesto
   */
  async remove(userId: string, month: number, year: number) {
    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(
        `No existe presupuesto para ${month}/${year}`,
      );
    }

    await this.prisma.budget.delete({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    return { message: 'Presupuesto eliminado exitosamente' };
  }

  /**
   * Agregar información de gasto y alertas al presupuesto
   */
  private async addSpentInfo(budget: any, userId: string) {
    // Calcular el gasto total del mes
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        category: {
          type: 'EXPENSE',
        },
      },
    });

    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;
    const isOverBudget = spent > budget.amount;
    const shouldAlert = percentage >= budget.alertAt;

    return {
      ...budget,
      spent,
      remaining,
      percentage: Math.round(percentage * 100) / 100, // 2 decimales
      isOverBudget,
      shouldAlert,
      alertMessage: shouldAlert
        ? `Has alcanzado el ${Math.round(percentage)}% de tu presupuesto`
        : null,
    };
  }
}
