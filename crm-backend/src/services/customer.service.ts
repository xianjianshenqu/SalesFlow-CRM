import prisma from '../repositories/prisma';
import { NotFoundError } from '../utils/response';
import type { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer.validator';

export class CustomerService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    stage?: string;
    priority?: string;
    source?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.stage && params.stage !== 'all') {
      where.stage = params.stage;
    }

    if (params.priority) {
      where.priority = params.priority;
    }

    if (params.source) {
      where.source = params.source;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { contactPerson: { contains: params.search } },
        { shortName: { contains: params.search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        opportunities: true,
        payments: true,
        proposals: true,
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    return customer;
  }

  async create(data: CreateCustomerInput, ownerId?: string) {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
        ownerId,
      },
    });

    return customer;
  }

  async update(id: string, data: UpdateCustomerInput) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundError('Customer');
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : undefined,
      },
    });

    return customer;
  }

  async delete(id: string) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundError('Customer');
    }

    await prisma.customer.delete({
      where: { id },
    });

    return { message: 'Customer deleted successfully' };
  }

  async getStats() {
    const [total, byStage, byPriority] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.groupBy({
        by: ['stage'],
        _count: true,
        _sum: { estimatedValue: true },
      }),
      prisma.customer.groupBy({
        by: ['priority'],
        _count: true,
      }),
    ]);

    const activeCount = await prisma.customer.count({
      where: { stage: { not: 'won' } },
    });

    const totalValue = await prisma.customer.aggregate({
      _sum: { estimatedValue: true },
    });

    return {
      total,
      activeCount,
      totalValue: totalValue._sum.estimatedValue || 0,
      byStage,
      byPriority,
    };
  }

  async getCustomerDistribution() {
    const byCity = await prisma.customer.groupBy({
      by: ['city'],
      _count: true,
    });

    const byIndustry = await prisma.customer.groupBy({
      by: ['industry'],
      _count: true,
    });

    const bySource = await prisma.customer.groupBy({
      by: ['source'],
      _count: true,
    });

    return {
      byCity,
      byIndustry,
      bySource,
    };
  }
}

export default new CustomerService();