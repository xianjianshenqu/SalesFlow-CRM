import prisma from '../repositories/prisma';
import { NotFoundError } from '../utils/response';
import type { CreateContactInput, UpdateContactInput } from '../validators/contact.validator';

export class ContactService {
  // 获取客户的所有联系人
  async findByCustomerId(customerId: string, params?: {
    role?: string;
    department?: string;
    isPrimary?: boolean;
    search?: string;
  }) {
    const where: any = { customerId };

    if (params?.role) {
      where.role = params.role;
    }

    if (params?.department) {
      where.department = { contains: params.department };
    }

    if (params?.isPrimary !== undefined) {
      where.isPrimary = params.isPrimary;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { title: { contains: params.search } },
        { department: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return contacts;
  }

  // 获取单个联系人
  async findById(id: string) {
    const contact = await prisma.contact.findUnique({
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

    if (!contact) {
      throw new NotFoundError('Contact');
    }

    return contact;
  }

  // 创建联系人
  async create(customerId: string, data: CreateContactInput, userId?: string) {
    // 验证客户是否存在
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    // 如果设为主联系人，先取消其他主联系人
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: { customerId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.contact.create({
      data: {
        ...data,
        customerId,
        createdById: userId,
        lastContact: data.lastContact ? new Date(data.lastContact) : undefined,
      },
    });

    return contact;
  }

  // 更新联系人
  async update(id: string, data: UpdateContactInput) {
    const existingContact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundError('Contact');
    }

    // 如果设为主联系人，先取消其他主联系人
    if (data.isPrimary) {
      await prisma.contact.updateMany({
        where: { 
          customerId: existingContact.customerId, 
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...data,
        lastContact: data.lastContact ? new Date(data.lastContact) : undefined,
      },
    });

    return contact;
  }

  // 删除联系人
  async delete(id: string) {
    const existingContact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      throw new NotFoundError('Contact');
    }

    await prisma.contact.delete({
      where: { id },
    });

    return { message: 'Contact deleted successfully' };
  }

  // 设为主联系人
  async setPrimary(id: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundError('Contact');
    }

    // 取消其他主联系人
    await prisma.contact.updateMany({
      where: { 
        customerId: contact.customerId, 
        isPrimary: true 
      },
      data: { isPrimary: false },
    });

    // 设置当前联系人为主联系人
    const updatedContact = await prisma.contact.update({
      where: { id },
      data: { isPrimary: true },
    });

    return updatedContact;
  }

  // 批量导入联系人
  async batchImport(customerId: string, contacts: CreateContactInput[], userId?: string) {
    // 验证客户是否存在
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    const createdContacts = await prisma.$transaction(
      contacts.map((contact) =>
        prisma.contact.create({
          data: {
            ...contact,
            customerId,
            createdById: userId,
            lastContact: contact.lastContact ? new Date(contact.lastContact) : undefined,
          },
        })
      )
    );

    return createdContacts;
  }

  // 获取联系人统计
  async getStats(customerId?: string) {
    const where = customerId ? { customerId } : {};

    const [total, byRole, primaryCount] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.groupBy({
        by: ['role'],
        where,
        _count: true,
      }),
      prisma.contact.count({
        where: { ...where, isPrimary: true },
      }),
    ]);

    return {
      total,
      primaryCount,
      byRole,
    };
  }

  // 按部门分组统计
  async getByDepartment(customerId: string) {
    const result = await prisma.contact.groupBy({
      by: ['department'],
      where: { customerId },
      _count: true,
    });

    return result;
  }
}

export default new ContactService();