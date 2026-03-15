import prisma from '../repositories/prisma';
import { NotFoundError } from '../utils/response';
import type { CreateCustomerFromCardInput, OcrResult } from '../validators/businessCard.validator';

// OCR 配置 - 可以后期替换为真实的OCR服务
interface OCRConfig {
  provider: 'tencent' | 'baidu' | 'mock';
  apiKey?: string;
  apiSecret?: string;
}

const ocrConfig: OCRConfig = {
  provider: (process.env.OCR_PROVIDER as OCRConfig['provider']) || 'mock',
  apiKey: process.env.OCR_API_KEY,
  apiSecret: process.env.OCR_API_SECRET,
};

export class BusinessCardService {
  // OCR识别名片
  async scanBusinessCard(imageUrl: string): Promise<OcrResult> {
    // 根据配置选择OCR提供商
    switch (ocrConfig.provider) {
      case 'tencent':
        return this.tencentOCR(imageUrl);
      case 'baidu':
        return this.baiduOCR(imageUrl);
      default:
        return this.mockOCR(imageUrl);
    }
  }

  // 腾讯云OCR - 实际实现时需要安装 tencentcloud-sdk-nodejs
  private async tencentOCR(imageUrl: string): Promise<OcrResult> {
    // TODO: 实现腾讯云OCR
    // const tencentcloud = require("tencentcloud-sdk-nodejs");
    // const OcrClient = tencentcloud.ocr.v20181119.Client;
    // ... 调用API
    return this.mockOCR(imageUrl);
  }

  // 百度OCR - 实际实现时需要安装 baidu-aip-sdk
  private async baiduOCR(imageUrl: string): Promise<OcrResult> {
    // TODO: 实现百度OCR
    // const AipOcrClient = require("baidu-aip-sdk").ocr;
    // ... 调用API
    return this.mockOCR(imageUrl);
  }

  // Mock OCR - 用于开发和测试
  private mockOCR(_imageUrl: string): OcrResult {
    // 返回模拟的识别结果
    const mockResults: OcrResult[] = [
      {
        name: '张伟',
        title: '技术总监',
        department: '技术部',
        company: '示例科技有限公司',
        email: 'zhangwei@example.com',
        phone: '010-88888888',
        mobile: '13800138000',
        address: '北京市海淀区中关村大街1号',
        website: 'www.example.com',
      },
      {
        name: '李明',
        title: '采购经理',
        department: '采购部',
        company: '创新实业集团',
        email: 'liming@chuangxin.com',
        phone: '021-66666666',
        mobile: '13900139000',
        address: '上海市浦东新区陆家嘴环路1000号',
      },
      {
        name: '王芳',
        title: '总经理',
        department: '管理层',
        company: '未来智能科技',
        email: 'wangfang@future-ai.com',
        mobile: '13600136000',
        wechat: 'wangfang_ai',
      },
    ];
    
    // 随机返回一个模拟结果
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }

  // 上传并识别名片
  async uploadAndScan(imageUrl: string, userId?: string) {
    // 创建名片记录
    const businessCard = await prisma.businessCard.create({
      data: {
        imageUrl,
        status: 'pending',
        createdById: userId,
      },
    });

    try {
      // 执行OCR识别
      const ocrResult = await this.scanBusinessCard(imageUrl);
      
      // 更新名片记录
      const updatedCard = await prisma.businessCard.update({
        where: { id: businessCard.id },
        data: {
          ocrResult,
          rawData: ocrResult,
          status: 'processed',
        },
      });

      return updatedCard;
    } catch (error) {
      // 更新失败状态
      await prisma.businessCard.update({
        where: { id: businessCard.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'OCR识别失败',
        },
      });
      throw error;
    }
  }

  // 从名片创建客户和联系人
  async createCustomerFromCard(
    businessCardId: string,
    data: CreateCustomerFromCardInput,
    userId?: string
  ) {
    const businessCard = await prisma.businessCard.findUnique({
      where: { id: businessCardId },
    });

    if (!businessCard) {
      throw new NotFoundError('BusinessCard');
    }

    // 生成客户简称
    const shortName = data.shortName || this.generateShortName(data.name);

    // 创建客户和联系人
    const result = await prisma.$transaction(async (tx) => {
      // 创建客户
      const customer = await tx.customer.create({
        data: {
          name: data.name,
          shortName,
          industry: data.industry,
          city: data.city,
          address: data.address,
          priority: data.priority,
          source: data.source,
          notes: data.notes,
          contactPerson: data.contactName,
          phone: data.contactMobile || data.contactPhone,
          stage: 'new_lead',
          ownerId: userId,
          createdById: userId,
        },
      });

      // 创建联系人
      const contact = await tx.contact.create({
        data: {
          customerId: customer.id,
          name: data.contactName,
          title: data.contactTitle,
          department: data.contactDepartment,
          email: data.contactEmail,
          phone: data.contactPhone,
          mobile: data.contactMobile,
          wechat: data.contactWechat,
          role: data.contactRole,
          isPrimary: true,
          createdById: userId,
        },
      });

      // 更新名片记录
      await tx.businessCard.update({
        where: { id: businessCardId },
        data: {
          customerId: customer.id,
        },
      });

      return { customer, contact };
    });

    return result;
  }

  // 生成客户简称
  private generateShortName(name: string): string {
    // 简单的简称生成逻辑：取每个汉字的首字母或前两个字
    if (name.length <= 4) {
      return name.substring(0, 2);
    }
    // 如果名称中包含"有限公司"等，去掉后取前面部分
    const cleanName = name
      .replace(/有限公司|股份有限公司|集团|科技|技术|信息|网络/g, '')
      .substring(0, 2);
    return cleanName || name.substring(0, 2);
  }

  // 获取名片列表
  async findAll(params?: { status?: string; page?: number; pageSize?: number }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }

    const [cards, total] = await Promise.all([
      prisma.businessCard.findMany({
        where,
        skip,
        take: pageSize,
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
      prisma.businessCard.count({ where }),
    ]);

    return {
      data: cards,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取单个名片
  async findById(id: string) {
    const card = await prisma.businessCard.findUnique({
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

    if (!card) {
      throw new NotFoundError('BusinessCard');
    }

    return card;
  }

  // 删除名片
  async delete(id: string) {
    const card = await prisma.businessCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundError('BusinessCard');
    }

    await prisma.businessCard.delete({
      where: { id },
    });

    return { message: 'Business card deleted successfully' };
  }
}

export default new BusinessCardService();