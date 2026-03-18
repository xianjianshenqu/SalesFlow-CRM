import prisma from '../repositories/prisma';
import { NotFoundError } from '../utils/response';
import type { CreateOpportunityInput, UpdateOpportunityInput } from '../validators/opportunity.validator';

export class OpportunityService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    stage?: string;
    priority?: string;
    customerId?: string;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.stage) {
      where.stage = params.stage;
    }

    if (params.priority) {
      where.priority = params.priority;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          customer: {
            select: { id: true, name: true, shortName: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.opportunity.count({ where }),
    ]);

    return {
      data: opportunities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!opportunity) {
      throw new NotFoundError('Opportunity');
    }

    return opportunity;
  }

  async create(data: CreateOpportunityInput, ownerId?: string) {
    const opportunity = await prisma.opportunity.create({
      data: {
        ...data,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        ownerId,
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    return opportunity;
  }

  async update(id: string, data: UpdateOpportunityInput) {
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Opportunity');
    }

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        ...data,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
      },
    });

    return opportunity;
  }

  async delete(id: string) {
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Opportunity');
    }

    await prisma.opportunity.delete({ where: { id } });
    return { message: 'Opportunity deleted successfully' };
  }

  async moveStage(id: string, stage: string) {
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: { stage },
    });

    return opportunity;
  }

  async getStats() {
    // 完整的销售阶段列表 - 与前端 types/index.ts 保持一致
    const stages = ['new_lead', 'contacted', 'solution', 'quoted', 'negotiation', 'procurement_process', 'contract_stage', 'won'] as const;
    
    const stageStats = await Promise.all(
      stages.map(async (stage) => {
        const opportunities = await prisma.opportunity.findMany({
          where: { stage },
          select: { value: true },
        });
        
        return {
          stage,
          count: opportunities.length,
          value: opportunities.reduce((sum, o) => sum + Number(o.value), 0),
        };
      })
    );

    const totalValue = stageStats.reduce((sum, s) => sum + s.value, 0);
    const totalOpportunities = stageStats.reduce((sum, s) => sum + s.count, 0);

    // Calculate weighted value (value * probability)
    const opportunities = await prisma.opportunity.findMany({
      where: { stage: { not: 'won' } },
      select: { value: true, probability: true },
    });
    
    const calculatedWeightedValue = opportunities.reduce(
      (sum, o) => sum + Number(o.value) * (o.probability / 100),
      0
    );

    return {
      stageStats,
      totalValue,
      totalOpportunities,
      weightedValue: calculatedWeightedValue,
    };
  }
}

export default new OpportunityService();