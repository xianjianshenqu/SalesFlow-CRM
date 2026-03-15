import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      department: 'Management',
      phone: '13800138000',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create sales users
  const salesPassword = await hash('sales123', 12);
  
  const alex = await prisma.user.upsert({
    where: { email: 'alex@crm.com' },
    update: {},
    create: {
      email: 'alex@crm.com',
      password: salesPassword,
      name: 'Alex Chen',
      role: 'manager',
      department: '企业销售部',
      phone: '13800138001',
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@crm.com' },
    update: {},
    create: {
      email: 'sarah@crm.com',
      password: salesPassword,
      name: 'Sarah Wang',
      role: 'sales',
      department: '企业销售部',
      phone: '13800138002',
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: 'mike@crm.com' },
    update: {},
    create: {
      email: 'mike@crm.com',
      password: salesPassword,
      name: 'Mike Liu',
      role: 'sales',
      department: '中小企业部',
      phone: '13800138003',
    },
  });

  console.log('Created sales users');

  // Create team members
  await prisma.teamMember.createMany({
    data: [
      { name: 'Alex Chen', role: '销售经理', department: '企业销售部', revenue: 2850000, deals: 12, activities: 156, rank: 1 },
      { name: 'Sarah Wang', role: '高级销售代表', department: '企业销售部', revenue: 1920000, deals: 8, activities: 134, rank: 2 },
      { name: 'Mike Liu', role: '销售代表', department: '中小企业部', revenue: 1280000, deals: 6, activities: 98, rank: 3 },
      { name: 'Emily Zhang', role: '销售代表', department: '中小企业部', revenue: 980000, deals: 5, activities: 87, rank: 4 },
      { name: 'David Li', role: '销售代表', department: '渠道销售部', revenue: 750000, deals: 4, activities: 76, rank: 5 },
    ],
    skipDuplicates: true,
  });
  console.log('Created team members');

  // Create customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        id: 'c1',
        name: '华为技术有限公司',
        shortName: 'HW',
        email: 'li.wei@huawei.com',
        stage: 'negotiation',
        estimatedValue: 1250000,
        nextFollowUp: new Date('2023-10-14'),
        source: 'direct',
        priority: 'high',
        contactPerson: '李伟',
        phone: '13800138001',
        address: '深圳市龙岗区坂田华为基地',
        city: '深圳',
        industry: '通信设备',
      },
      {
        id: 'c2',
        name: '阿里巴巴集团',
        shortName: 'AL',
        email: 'zhang.m@alibaba-inc.com',
        stage: 'solution',
        estimatedValue: 850000,
        nextFollowUp: new Date('2023-10-18'),
        source: 'referral',
        priority: 'high',
        contactPerson: '张明',
        phone: '13800138002',
        address: '杭州市余杭区文一西路969号',
        city: '杭州',
        industry: '电子商务',
      },
      {
        id: 'c3',
        name: '比亚迪股份有限公司',
        shortName: 'BYD',
        email: 'chen.q@byd.com',
        stage: 'contacted',
        estimatedValue: 420000,
        nextFollowUp: new Date('2023-10-20'),
        source: 'website',
        priority: 'medium',
        contactPerson: '陈强',
        phone: '13800138003',
        address: '深圳市坪山区比亚迪路',
        city: '深圳',
        industry: '汽车制造',
      },
      {
        id: 'c4',
        name: '中国平安保险（集团）股份有限公司',
        shortName: 'PA',
        email: 'finance@pingan.com.cn',
        stage: 'won',
        estimatedValue: 2100000,
        source: 'partner',
        priority: 'high',
        contactPerson: '王芳',
        phone: '13800138004',
        address: '深圳市福田区福华三路',
        city: '深圳',
        industry: '金融服务',
      },
      {
        id: 'c5',
        name: '腾讯科技（深圳）有限公司',
        shortName: 'TN',
        email: 'marketing@tencent.com',
        stage: 'new_lead',
        estimatedValue: 120000,
        nextFollowUp: new Date('2023-10-16'),
        source: 'conference',
        priority: 'low',
        contactPerson: '刘洋',
        phone: '13800138005',
        address: '深圳市南山区科技园',
        city: '深圳',
        industry: '互联网',
      },
    ],
    skipDuplicates: true,
  });
  console.log('Created customers:', customers.count);

  // Create opportunities
  await prisma.opportunity.createMany({
    data: [
      { id: 'o1', customerId: 'c1', title: '企业数字化转型项目', stage: 'negotiation', value: 1250000, probability: 75, priority: 'high' },
      { id: 'o2', customerId: 'c2', title: '智能客服系统升级', stage: 'solution', value: 850000, probability: 60, priority: 'high' },
      { id: 'o3', customerId: 'c3', title: '供应链管理系统', stage: 'contacted', value: 420000, probability: 40, priority: 'medium' },
      { id: 'o4', customerId: 'c5', title: '云安全解决方案', stage: 'new_lead', value: 120000, probability: 20, priority: 'low' },
    ],
    skipDuplicates: true,
  });
  console.log('Created opportunities');

  // Create payments
  await prisma.payment.createMany({
    data: [
      { invoiceId: 'INV-2023-001', customerId: 'c4', totalAmount: 2100000, paidAmount: 2100000, balance: 0, status: 'paid', planType: '年度服务费', dueDate: new Date('2023-10-01') },
      { invoiceId: 'INV-2023-002', customerId: 'c1', totalAmount: 625000, paidAmount: 312500, balance: 312500, status: 'partial', planType: '首付款50%', dueDate: new Date('2023-10-15') },
      { invoiceId: 'INV-2023-003', customerId: 'c2', totalAmount: 425000, paidAmount: 0, balance: 425000, status: 'pending', planType: '项目启动款', dueDate: new Date('2023-11-01') },
    ],
    skipDuplicates: true,
  });
  console.log('Created payments');

  // Create presales resources
  await prisma.preSalesResource.createMany({
    data: [
      { name: '张技术', title: '高级售前工程师', skills: ['云计算', '大数据', 'AI'], status: 'available' },
      { name: '李方案', title: '方案架构师', skills: ['企业架构', '微服务', '安全'], status: 'busy', currentProject: '华为数字化转型' },
      { name: '王演示', title: '售前顾问', skills: ['产品演示', '需求分析'], status: 'available' },
    ],
    skipDuplicates: true,
  });
  console.log('Created presales resources');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });