/**
 * 陌生拜访AI助手服务
 * 提供企业信息智能分析、客户转换等功能
 */

import prisma from '../repositories/prisma';
import aiService, { CompanyIntelligenceResult } from './ai.service';
import { NotFoundError } from '../utils/response';

// 联系人角色类型
 type ContactRoleType = 'decision_maker' | 'key_influencer' | 'coach' | 'end_user' | 'gatekeeper' | 'blocker';

// 分析输入类型
interface AnalyzeTextInput {
  companyName: string;
}

interface AnalyzeImageInput {
  imageUrl: string;
}

type AnalyzeInput = AnalyzeTextInput | AnalyzeImageInput;

// 转换为客户输入
interface ConvertToCustomerInput {
  name: string;
  shortName?: string;
  industry?: string;
  city?: string;
  address?: string;
  priority?: 'high' | 'medium' | 'low';
  source?: 'direct' | 'referral' | 'website' | 'conference' | 'partner';
  notes?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export class ColdVisitService {
  /**
   * 分析企业信息
   * @param input 输入参数（公司名称或图片URL）
   * @param userId 用户ID
   */
  async analyzeCompany(input: AnalyzeInput, userId?: string): Promise<{
    id: string;
    companyName: string;
    inputType: string;
    intelligenceResult: CompanyIntelligenceResult;
    status: string;
  }> {
    // 确定输入类型
    const inputType = 'companyName' in input ? 'text' : 'image';
    const companyName = 'companyName' in input ? input.companyName : '';
    const imageUrl = 'imageUrl' in input ? input.imageUrl : undefined;

    // 创建初始记录
    const record = await prisma.coldVisitRecord.create({
      data: {
        companyName: companyName || '待识别企业',
        inputType,
        inputContent: inputType === 'text' ? companyName : undefined,
        imageUrl,
        status: 'analyzed',
        createdById: userId,
      },
    });

    try {
      // 调用AI服务进行分析
      const intelligenceResult = await aiService.analyzeCompany(companyName, imageUrl);

      // 更新记录
      const updatedRecord = await prisma.coldVisitRecord.update({
        where: { id: record.id },
        data: {
          companyName: intelligenceResult.basicInfo.name,
          intelligenceResult: intelligenceResult as any,
        },
      });

      return {
        id: updatedRecord.id,
        companyName: updatedRecord.companyName,
        inputType: updatedRecord.inputType,
        intelligenceResult,
        status: updatedRecord.status,
      };
    } catch (error) {
      // 更新失败状态
      await prisma.coldVisitRecord.update({
        where: { id: record.id },
        data: {
          status: 'analyzed',
          intelligenceResult: {
            error: error instanceof Error ? error.message : '分析失败',
          } as any,
        },
      });
      throw error;
    }
  }

  /**
   * 将分析记录转换为客户
   * @param recordId 分析记录ID
   * @param data 客户信息
   * @param userId 用户ID
   */
  async convertToCustomer(
    recordId: string,
    data: ConvertToCustomerInput,
    userId?: string
  ) {
    // 获取分析记录
    const record = await prisma.coldVisitRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundError('ColdVisitRecord');
    }

    // 从AI分析结果中提取补充信息
    const intelligence = record.intelligenceResult as CompanyIntelligenceResult | null;
    
    // 合并数据：用户输入优先，AI结果作为补充
    const customerData = {
      name: data.name || record.companyName,
      shortName: data.shortName || this.generateShortName(data.name || record.companyName),
      industry: data.industry || intelligence?.basicInfo.industry,
      city: data.city || this.extractCity(intelligence?.basicInfo.address),
      address: data.address || intelligence?.basicInfo.address,
      priority: data.priority || 'medium',
      source: data.source || 'direct',
      notes: data.notes || intelligence?.basicInfo.description,
      contactPerson: data.contactPerson || intelligence?.keyContacts?.[0]?.name,
      phone: data.phone,
      email: data.email,
      stage: 'new_lead',
      ownerId: userId,
      createdById: userId,
    };

    // 创建客户和联系人
    const result = await prisma.$transaction(async (tx) => {
      // 创建客户
      const customer = await tx.customer.create({
        data: customerData,
      });

      // 如果有联系人信息，创建联系人
      if (intelligence?.keyContacts && intelligence.keyContacts.length > 0) {
        const primaryContact = intelligence.keyContacts[0];
        await tx.contact.create({
          data: {
            customerId: customer.id,
            name: primaryContact.name,
            title: primaryContact.title,
            department: primaryContact.department,
            role: this.mapContactRole(primaryContact.title),
            isPrimary: true,
            notes: `来源: ${primaryContact.source}, 可信度: ${Math.round(primaryContact.confidence * 100)}%`,
            createdById: userId,
          },
        });
      }

      // 更新分析记录状态
      await tx.coldVisitRecord.update({
        where: { id: recordId },
        data: {
          customerId: customer.id,
          status: 'converted',
        },
      });

      return { customer, record };
    });

    return result;
  }

  /**
   * 获取分析历史记录
   * @param params 查询参数
   */
  async getHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.search) {
      where.companyName = {
        contains: params.search,
      };
    }

    const [records, total] = await Promise.all([
      prisma.coldVisitRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              shortName: true,
            },
          },
        },
      }),
      prisma.coldVisitRecord.count({ where }),
    ]);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个分析记录
   * @param id 记录ID
   */
  async findById(id: string) {
    const record = await prisma.coldVisitRecord.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundError('ColdVisitRecord');
    }

    return record;
  }

  /**
   * 删除分析记录
   * @param id 记录ID
   */
  async delete(id: string) {
    const record = await prisma.coldVisitRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundError('ColdVisitRecord');
    }

    await prisma.coldVisitRecord.delete({
      where: { id },
    });

    return { message: '记录已删除' };
  }

  /**
   * 生成客户简称
   */
  private generateShortName(name: string): string {
    if (!name) return 'XX';
    if (name.length <= 4) {
      return name.substring(0, 2);
    }
    // 去掉常见后缀
    const cleanName = name
      .replace(/有限公司|股份有限公司|集团|科技|技术|信息|网络/g, '')
      .substring(0, 2);
    return cleanName || name.substring(0, 2);
  }

  /**
   * 从地址中提取城市
   */
  private extractCity(address?: string): string | undefined {
    if (!address) return undefined;
    // 简单的城市提取逻辑
    const cityMatch = address.match(/(北京市|上海市|广州市|深圳市|杭州市|成都市|武汉市|南京市|西安市|苏州市|天津市|重庆市|长沙市|郑州市|东莞市|青岛市|沈阳市|宁波市|昆明市)/);
    if (cityMatch) {
      return cityMatch[1];
    }
    // 尝试匹配省份+城市
    const provinceMatch = address.match(/(.{2,3}省)(.{2,4}市)/);
    if (provinceMatch) {
      return provinceMatch[2];
    }
    return undefined;
  }

  /**
   * 根据职位映射联系人角色
   */
  private mapContactRole(title: string): ContactRoleType {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('总经理') || titleLower.includes('ceo') || titleLower.includes('总裁')) {
      return 'decision_maker';
    }
    if (titleLower.includes('总监') || titleLower.includes('经理')) {
      return 'key_influencer';
    }
    if (titleLower.includes('采购')) {
      return 'gatekeeper';
    }
    return 'end_user';
  }
}

export default new ColdVisitService();