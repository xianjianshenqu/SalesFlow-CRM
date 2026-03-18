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
    // Use any to bypass type check until Prisma client is regenerated
    const customer = await (prisma.customer as any).create({
      data: {
        name: data.name,
        shortName: data.shortName,
        email: data.email || null,
        stage: data.stage || 'new',
        estimatedValue: data.estimatedValue || 0,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
        source: data.source || null,
        priority: data.priority || 'medium',
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        district: data.district || null,
        industry: data.industry || null,
        notes: data.notes || null,
        customerType: data.customerType || 'non_user',
        companyFullName: data.companyFullName || null,
        creditCode: data.creditCode || null,
        registeredCapital: data.registeredCapital || null,
        establishDate: data.establishDate ? new Date(data.establishDate) : null,
        businessScope: data.businessScope || null,
        legalPerson: data.legalPerson || null,
        companyStatus: data.companyStatus || null,
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

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortName !== undefined) updateData.shortName = data.shortName;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.estimatedValue !== undefined) updateData.estimatedValue = data.estimatedValue;
    if (data.nextFollowUp !== undefined) updateData.nextFollowUp = data.nextFollowUp ? new Date(data.nextFollowUp) : null;
    if (data.source !== undefined) updateData.source = data.source || null;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.province !== undefined) updateData.province = data.province || null;
    if (data.district !== undefined) updateData.district = data.district || null;
    if (data.industry !== undefined) updateData.industry = data.industry || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.customerType !== undefined) updateData.customerType = data.customerType;
    if (data.companyFullName !== undefined) updateData.companyFullName = data.companyFullName || null;
    if (data.creditCode !== undefined) updateData.creditCode = data.creditCode || null;
    if (data.registeredCapital !== undefined) updateData.registeredCapital = data.registeredCapital || null;
    if (data.establishDate !== undefined) updateData.establishDate = data.establishDate ? new Date(data.establishDate) : null;
    if (data.businessScope !== undefined) updateData.businessScope = data.businessScope || null;
    if (data.legalPerson !== undefined) updateData.legalPerson = data.legalPerson || null;
    if (data.companyStatus !== undefined) updateData.companyStatus = data.companyStatus || null;

    const customer = await (prisma.customer as any).update({
      where: { id },
      data: updateData,
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