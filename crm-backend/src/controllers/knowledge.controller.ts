import { Request, Response, NextFunction } from 'express';
import * as xlsx from 'xlsx';
import { parse as csvParse } from 'csv-parse/sync';
import knowledgeService from '../services/knowledge.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 知识库控制器
 */
class KnowledgeController {
  // ==================== 文档管理 ====================

  /**
   * 获取文档列表
   * @route GET /api/v1/knowledge/documents
   */
  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await knowledgeService.getDocuments(req.query as any);
      return success(res, result, '获取文档列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取文档详情
   * @route GET /api/v1/knowledge/documents/:id
   */
  async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await knowledgeService.getDocumentById(id);
      
      if (!document) {
        throw new AppError(404, '文档不存在', 'NOT_FOUND');
      }
      
      return success(res, document, '获取文档详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 上传文档
   * @route POST /api/v1/knowledge/documents/upload
   */
  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const file = req.file;
      const { title, category, description, tags, subCategory } = req.body;

      // 构建文件信息
      const fileData: any = {
        title,
        category,
        description,
        tags: tags ? JSON.parse(tags) : [],
        subCategory,
      };

      if (file) {
        fileData.fileUrl = `/uploads/knowledge/${file.filename}`;
        fileData.fileName = file.originalname;
        fileData.fileType = file.originalname.split('.').pop()?.toLowerCase();
        fileData.fileSize = file.size;
      }

      const document = await knowledgeService.uploadDocument(fileData, userId);
      return created(res, document, '文档上传成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除文档
   * @route DELETE /api/v1/knowledge/documents/:id
   */
  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await knowledgeService.deleteDocument(id);
      return success(res, null, '文档删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 解析文档
   * @route POST /api/v1/knowledge/documents/:id/parse
   */
  async parseDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await knowledgeService.parseDocument(id);
      return success(res, result, '文档解析成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 产品价格表 ====================

  /**
   * 获取产品列表
   * @route GET /api/v1/knowledge/products
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await knowledgeService.getProducts(req.query as any);
      return success(res, result, '获取产品列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建产品
   * @route POST /api/v1/knowledge/products
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await knowledgeService.createProduct(req.body);
      return created(res, product, '产品创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新产品
   * @route PUT /api/v1/knowledge/products/:id
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await knowledgeService.updateProduct(id, req.body);
      return success(res, product, '产品更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除产品
   * @route DELETE /api/v1/knowledge/products/:id
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await knowledgeService.deleteProduct(id);
      return success(res, null, '产品删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 导入产品（Excel/CSV）
   * @route POST /api/v1/knowledge/products/import
   */
  async importProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        throw new AppError(400, '请上传文件', 'BAD_REQUEST');
      }

      const fileType = file.originalname.split('.').pop()?.toLowerCase();
      let rows: any[] = [];

      if (fileType === 'xlsx' || fileType === 'xls') {
        // 解析 Excel
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = xlsx.utils.sheet_to_json(sheet);
      } else if (fileType === 'csv') {
        // 解析 CSV
        const content = file.buffer.toString('utf-8');
        rows = csvParse(content, {
          columns: true,
          skip_empty_lines: true,
        });
      } else {
        throw new AppError(400, '不支持的文件格式，请上传 Excel 或 CSV 文件', 'BAD_REQUEST');
      }

      // 映射字段名
      const mappedRows = rows.map((row: any) => ({
        productName: row['产品名称'] || row['productName'] || row['name'],
        productCode: row['产品编码'] || row['productCode'] || row['code'],
        category: row['分类'] || row['category'],
        specification: row['规格'] || row['specification'],
        unitPrice: parseFloat(row['单价'] || row['unitPrice'] || row['price']) || 0,
        unit: row['单位'] || row['unit'],
        minQuantity: parseInt(row['最小数量'] || row['minQuantity']) || undefined,
        notes: row['备注'] || row['notes'],
      })).filter(row => row.productName); // 过滤无效行

      if (mappedRows.length === 0) {
        throw new AppError(400, '未找到有效的产品数据', 'BAD_REQUEST');
      }

      const result = await knowledgeService.importProducts(mappedRows);
      return success(res, result, '产品导入完成');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 导出产品（Excel）
   * @route GET /api/v1/knowledge/products/export
   */
  async exportProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await knowledgeService.exportProducts(req.query as any);

      // 创建 Excel 工作簿
      const workbook = xlsx.utils.book_new();
      
      // 准备数据
      const data = products.map((p: any) => ({
        '产品名称': p.productName,
        '产品编码': p.productCode || '',
        '分类': p.category || '',
        '规格': p.specification || '',
        '单价': Number(p.unitPrice),
        '单位': p.unit || '',
        '最小数量': p.minQuantity || '',
        '状态': p.isActive ? '启用' : '停用',
        '备注': p.notes || '',
      }));

      const worksheet = xlsx.utils.json_to_sheet(data);
      
      // 设置列宽
      worksheet['!cols'] = [
        { wch: 20 }, // 产品名称
        { wch: 15 }, // 产品编码
        { wch: 12 }, // 分类
        { wch: 20 }, // 规格
        { wch: 10 }, // 单价
        { wch: 8 },  // 单位
        { wch: 10 }, // 最小数量
        { wch: 8 },  // 状态
        { wch: 30 }, // 备注
      ];

      xlsx.utils.book_append_sheet(workbook, worksheet, '产品价格表');

      // 生成 buffer
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // 设置响应头
      const fileName = `产品价格表_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 合同模板 ====================

  /**
   * 获取合同模板列表
   * @route GET /api/v1/knowledge/contracts
   */
  async getContracts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await knowledgeService.getContracts(req.query as any);
      return success(res, result, '获取合同模板列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取合同模板详情
   * @route GET /api/v1/knowledge/contracts/:id
   */
  async getContractById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await knowledgeService.getContractById(id);
      
      if (!contract) {
        throw new AppError(404, '合同模板不存在', 'NOT_FOUND');
      }
      
      return success(res, contract, '获取合同模板详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建合同模板
   * @route POST /api/v1/knowledge/contracts
   */
  async createContract(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const contract = await knowledgeService.createContract(req.body, userId);
      return created(res, contract, '合同模板创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新合同模板
   * @route PUT /api/v1/knowledge/contracts/:id
   */
  async updateContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const contract = await knowledgeService.updateContract(id, req.body);
      return success(res, contract, '合同模板更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除合同模板
   * @route DELETE /api/v1/knowledge/contracts/:id
   */
  async deleteContract(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await knowledgeService.deleteContract(id);
      return success(res, null, '合同模板删除成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 自定义数据表 ====================

  /**
   * 获取自定义数据表列表
   * @route GET /api/v1/knowledge/custom-tables
   */
  async getCustomTables(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const tables = await knowledgeService.getCustomTables(userId);
      return success(res, tables, '获取数据表列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建自定义数据表
   * @route POST /api/v1/knowledge/custom-tables
   */
  async createCustomTable(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const table = await knowledgeService.createCustomTable(req.body, userId);
      return created(res, table, '数据表创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新自定义数据表
   * @route PUT /api/v1/knowledge/custom-tables/:id
   */
  async updateCustomTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const table = await knowledgeService.updateCustomTable(id, req.body);
      return success(res, table, '数据表更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除自定义数据表
   * @route DELETE /api/v1/knowledge/custom-tables/:id
   */
  async deleteCustomTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await knowledgeService.deleteCustomTable(id);
      return success(res, null, '数据表删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取自定义数据表行数据
   * @route GET /api/v1/knowledge/custom-tables/:id/rows
   */
  async getCustomTableRows(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await knowledgeService.getCustomTableRows(id, req.query as any);
      return success(res, result, '获取数据行成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加自定义数据行
   * @route POST /api/v1/knowledge/custom-tables/:id/rows
   */
  async createCustomTableRow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const row = await knowledgeService.createCustomTableRow(id, req.body);
      return created(res, row, '数据行添加成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新自定义数据行
   * @route PUT /api/v1/knowledge/custom-tables/:id/rows/:rowId
   */
  async updateCustomTableRow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, rowId } = req.params;
      const row = await knowledgeService.updateCustomTableRow(id, rowId, req.body);
      return success(res, row, '数据行更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除自定义数据行
   * @route DELETE /api/v1/knowledge/custom-tables/:id/rows/:rowId
   */
  async deleteCustomTableRow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, rowId } = req.params;
      await knowledgeService.deleteCustomTableRow(id, rowId);
      return success(res, null, '数据行删除成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 知识库搜索 ====================

  /**
   * 知识库搜索
   * @route GET /api/v1/knowledge/search
   */
  async searchKnowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, types, limit } = req.query;
      
      if (!q) {
        throw new AppError(400, '搜索关键词不能为空', 'BAD_REQUEST');
      }

      const typeArray = types ? (types as string).split(',') : undefined;
      
      const result = await knowledgeService.searchKnowledge({
        q: q as string,
        types: typeArray,
        limit: limit ? parseInt(limit as string) : 10,
      });
      
      return success(res, result, '搜索完成');
    } catch (error) {
      next(error);
    }
  }
}

export default new KnowledgeController();
