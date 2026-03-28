import { PrismaClient } from '@prisma/client';
import prisma from '../repositories/prisma';
import {
  DocumentQueryInput,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput,
  CreateContractInput,
  UpdateContractInput,
  ContractQueryInput,
  CreateCustomTableInput,
  UpdateCustomTableInput,
  CreateCustomTableRowInput,
  UpdateCustomTableRowInput,
  CustomTableRowQueryInput,
} from '../validators/knowledge.validator';

/**
 * 知识库服务 - 处理企业知识库相关业务逻辑
 */
class KnowledgeService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // ==================== 文档管理 ====================

  /**
   * 获取文档列表（分页、筛选）
   */
  async getDocuments(query: DocumentQueryInput) {
    const { page, limit, category, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, documents] = await Promise.all([
      (this.prisma as any).knowledgeDocument.count({ where }),
      (this.prisma as any).knowledgeDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取文档详情
   */
  async getDocumentById(id: string) {
    return (this.prisma as any).knowledgeDocument.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 创建文档记录（文件已由 multer 处理）
   */
  async uploadDocument(data: {
    title: string;
    category: string;
    description?: string;
    tags?: string[];
    subCategory?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  }, userId: string) {
    return (this.prisma as any).knowledgeDocument.create({
      data: {
        title: data.title,
        category: data.category,
        description: data.description,
        tags: data.tags || [],
        subCategory: data.subCategory,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 删除文档
   */
  async deleteDocument(id: string) {
    return (this.prisma as any).knowledgeDocument.delete({
      where: { id },
    });
  }

  /**
   * 解析文档（模拟解析）
   */
  async parseDocument(id: string) {
    const document = await this.getDocumentById(id);
    if (!document) {
      throw new Error('文档不存在');
    }

    // 模拟解析内容
    let parsedContent = '';
    const fileType = document.fileType?.toLowerCase();

    if (fileType === 'xlsx' || fileType === 'xls') {
      parsedContent = `[Excel解析结果]\n文件: ${document.fileName}\n已成功解析表格数据，可导入到产品价格表或自定义数据表。`;
    } else if (fileType === 'csv') {
      parsedContent = `[CSV解析结果]\n文件: ${document.fileName}\n已成功解析CSV数据，可导入到产品价格表或自定义数据表。`;
    } else if (fileType === 'pdf') {
      parsedContent = `[PDF解析结果]\n文件: ${document.fileName}\n已提取文本内容，可用于知识检索。`;
    } else if (fileType === 'docx' || fileType === 'doc') {
      parsedContent = `[Word解析结果]\n文件: ${document.fileName}\n已提取文档内容，可用于知识检索。`;
    } else {
      parsedContent = `[解析结果]\n文件: ${document.fileName}\n文件已上传，内容可手动编辑或自动解析。`;
    }

    // 更新文档内容
    return (this.prisma as any).knowledgeDocument.update({
      where: { id },
      data: { content: parsedContent },
    });
  }

  // ==================== 产品价格表 ====================

  /**
   * 获取产品列表（分页、筛选）
   */
  async getProducts(query: ProductQueryInput) {
    const { page, limit, category, search, isActive, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { productCode: { contains: search } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.unitPrice = {};
      if (minPrice !== undefined) where.unitPrice.gte = minPrice;
      if (maxPrice !== undefined) where.unitPrice.lte = maxPrice;
    }

    const [total, products] = await Promise.all([
      (this.prisma as any).productPricing.count({ where }),
      (this.prisma as any).productPricing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 创建产品
   */
  async createProduct(data: CreateProductInput) {
    const productData: any = {
      productName: data.productName,
      productCode: data.productCode,
      category: data.category,
      specification: data.specification,
      unitPrice: data.unitPrice,
      unit: data.unit,
      minQuantity: data.minQuantity,
      discount: data.discount,
      notes: data.notes,
      documentId: data.documentId,
    };

    if (data.validFrom) productData.validFrom = new Date(data.validFrom);
    if (data.validUntil) productData.validUntil = new Date(data.validUntil);

    return (this.prisma as any).productPricing.create({
      data: productData,
    });
  }

  /**
   * 更新产品
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    const updateData: any = { ...data };
    
    if (data.validFrom !== undefined) {
      updateData.validFrom = data.validFrom ? new Date(data.validFrom) : null;
    }
    if (data.validUntil !== undefined) {
      updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
    }

    return (this.prisma as any).productPricing.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * 删除产品
   */
  async deleteProduct(id: string) {
    return (this.prisma as any).productPricing.delete({
      where: { id },
    });
  }

  /**
   * 批量导入产品
   */
  async importProducts(rows: Array<{
    productName: string;
    productCode?: string;
    category?: string;
    specification?: string;
    unitPrice: number;
    unit?: string;
    minQuantity?: number;
    notes?: string;
  }>, documentId?: string) {
    const results = [];
    
    for (const row of rows) {
      try {
        const product = await (this.prisma as any).productPricing.create({
          data: {
            productName: row.productName,
            productCode: row.productCode,
            category: row.category,
            specification: row.specification,
            unitPrice: row.unitPrice,
            unit: row.unit,
            minQuantity: row.minQuantity,
            notes: row.notes,
            documentId,
          },
        });
        results.push({ success: true, data: product });
      } catch (error: any) {
        results.push({ success: false, error: error.message, row });
      }
    }

    return {
      total: rows.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  /**
   * 导出产品
   */
  async exportProducts(query: Partial<ProductQueryInput> = {}) {
    const { category, search, isActive } = query;

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { productCode: { contains: search } },
      ];
    }

    return (this.prisma as any).productPricing.findMany({
      where,
      orderBy: { productName: 'asc' },
    });
  }

  // ==================== 合同模板 ====================

  /**
   * 获取合同模板列表
   */
  async getContracts(query: ContractQueryInput) {
    const { page, limit, category, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, contracts] = await Promise.all([
      (this.prisma as any).contractTemplate.count({ where }),
      (this.prisma as any).contractTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { usageCount: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取合同模板详情
   */
  async getContractById(id: string) {
    return (this.prisma as any).contractTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 创建合同模板
   */
  async createContract(data: CreateContractInput, userId: string) {
    return (this.prisma as any).contractTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        content: data.content,
        variables: data.variables || [],
        tags: data.tags || [],
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 更新合同模板
   */
  async updateContract(id: string, data: UpdateContractInput) {
    return (this.prisma as any).contractTemplate.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        content: data.content,
        variables: data.variables,
        tags: data.tags,
        isActive: data.isActive,
      },
    });
  }

  /**
   * 删除合同模板
   */
  async deleteContract(id: string) {
    return (this.prisma as any).contractTemplate.delete({
      where: { id },
    });
  }

  /**
   * 增加模板使用次数
   */
  async incrementContractUsage(id: string) {
    return (this.prisma as any).contractTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }

  // ==================== 自定义数据表 ====================

  /**
   * 获取自定义数据表列表
   */
  async getCustomTables(userId: string) {
    return (this.prisma as any).customDataTable.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { rows: true },
        },
      },
    });
  }

  /**
   * 创建自定义数据表
   */
  async createCustomTable(data: CreateCustomTableInput, userId: string) {
    return (this.prisma as any).customDataTable.create({
      data: {
        name: data.name,
        description: data.description,
        columns: data.columns,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 更新自定义数据表
   */
  async updateCustomTable(id: string, data: UpdateCustomTableInput) {
    return (this.prisma as any).customDataTable.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        columns: data.columns,
      },
    });
  }

  /**
   * 删除自定义数据表（级联删除行）
   */
  async deleteCustomTable(id: string) {
    return (this.prisma as any).customDataTable.delete({
      where: { id },
    });
  }

  /**
   * 获取自定义数据表行数据
   */
  async getCustomTableRows(tableId: string, query: CustomTableRowQueryInput) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { tableId };
    if (search) {
      // 在 JSON data 字段中搜索
      where.data = {
        string_contains: search,
      };
    }

    const [total, rows] = await Promise.all([
      (this.prisma as any).customDataRow.count({ where }),
      (this.prisma as any).customDataRow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 添加自定义数据行
   */
  async createCustomTableRow(tableId: string, data: CreateCustomTableRowInput) {
    // 验证表存在
    const table = await (this.prisma as any).customDataTable.findUnique({
      where: { id: tableId },
    });
    if (!table) {
      throw new Error('数据表不存在');
    }

    return (this.prisma as any).customDataRow.create({
      data: {
        tableId,
        data: data.data,
      },
    });
  }

  /**
   * 更新自定义数据行
   */
  async updateCustomTableRow(tableId: string, rowId: string, data: UpdateCustomTableRowInput) {
    // 验证行属于该表
    const row = await (this.prisma as any).customDataRow.findFirst({
      where: { id: rowId, tableId },
    });
    if (!row) {
      throw new Error('数据行不存在或不属于该表');
    }

    return (this.prisma as any).customDataRow.update({
      where: { id: rowId },
      data: { data: data.data },
    });
  }

  /**
   * 删除自定义数据行
   */
  async deleteCustomTableRow(tableId: string, rowId: string) {
    // 验证行属于该表
    const row = await (this.prisma as any).customDataRow.findFirst({
      where: { id: rowId, tableId },
    });
    if (!row) {
      throw new Error('数据行不存在或不属于该表');
    }

    return (this.prisma as any).customDataRow.delete({
      where: { id: rowId },
    });
  }

  // ==================== 知识库搜索 ====================

  /**
   * 跨表搜索知识库
   */
  async searchKnowledge(query: { q: string; types?: string[]; limit?: number }) {
    const { q, types, limit = 10 } = query;
    const results: any = {
      documents: [],
      products: [],
      contracts: [],
    };

    const searchLimit = Math.min(limit, 50);

    // 搜索文档
    if (!types || types.includes('documents')) {
      results.documents = await (this.prisma as any).knowledgeDocument.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { content: { contains: q } },
          ],
        },
        take: searchLimit,
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
          fileType: true,
          createdAt: true,
        },
      });
    }

    // 搜索产品
    if (!types || types.includes('products')) {
      results.products = await (this.prisma as any).productPricing.findMany({
        where: {
          isActive: true,
          OR: [
            { productName: { contains: q } },
            { productCode: { contains: q } },
            { specification: { contains: q } },
          ],
        },
        take: searchLimit,
        select: {
          id: true,
          productName: true,
          productCode: true,
          category: true,
          unitPrice: true,
          unit: true,
        },
      });
    }

    // 搜索合同模板
    if (!types || types.includes('contracts')) {
      results.contracts = await (this.prisma as any).contractTemplate.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { content: { contains: q } },
          ],
        },
        take: searchLimit,
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          usageCount: true,
        },
      });
    }

    // 计算总结果数
    const total = results.documents.length + results.products.length + results.contracts.length;

    return {
      query: q,
      total,
      results,
    };
  }
}

export default new KnowledgeService();
