import prisma from '../repositories/prisma';
import { NotFoundError } from '../utils/response';
import type { CreatePaymentInput, UpdatePaymentInput } from '../validators/payment.validator';

export class PaymentService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    customerId?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          customer: {
            select: { id: true, name: true, shortName: true },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    return payment;
  }

  async create(data: CreatePaymentInput) {
    const balance = data.totalAmount - (data.paidAmount || 0);
    
    const payment = await prisma.payment.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        lastReminder: data.lastReminder ? new Date(data.lastReminder) : null,
        balance,
      },
    });

    return payment;
  }

  async update(id: string, data: UpdatePaymentInput) {
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Payment');
    }

    const paidAmount = data.paidAmount ?? existing.paidAmount;
    const totalAmount = data.totalAmount ?? existing.totalAmount;
    const balance = Number(totalAmount) - Number(paidAmount);

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        lastReminder: data.lastReminder ? new Date(data.lastReminder) : undefined,
        balance,
      },
    });

    return payment;
  }

  async delete(id: string) {
    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Payment');
    }

    await prisma.payment.delete({ where: { id } });
    return { message: 'Payment deleted successfully' };
  }

  async getStats() {
    const [totalPaid, totalPending, totalOverdue, totalCount] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'paid' },
        _sum: { paidAmount: true },
      }),
      prisma.payment.aggregate({
        where: { OR: [{ status: 'pending' }, { status: 'partial' }] },
        _sum: { balance: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'overdue' },
        _sum: { balance: true },
      }),
      prisma.payment.count(),
    ]);

    return {
      totalPaid: totalPaid._sum.paidAmount || 0,
      totalPending: totalPending._sum.balance || 0,
      totalOverdue: totalOverdue._sum.balance || 0,
      totalCount,
    };
  }

  async getOverdue() {
    const payments = await prisma.payment.findMany({
      where: { status: 'overdue' },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return payments;
  }

  async getForecast() {
    const payments = await prisma.payment.findMany({
      where: {
        status: { in: ['pending', 'partial'] },
      },
      select: {
        dueDate: true,
        balance: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, { expected: number; actual: number }> = {};
    
    payments.forEach((p) => {
      const month = new Date(p.dueDate).toLocaleString('zh-CN', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { expected: 0, actual: 0 };
      }
      monthlyData[month].expected += Number(p.balance);
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      expected: data.expected,
      actual: data.actual,
    }));
  }
}

export default new PaymentService();