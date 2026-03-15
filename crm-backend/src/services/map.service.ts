import { PrismaClient } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CustomerDistributionQueryInput, OptimizeRouteInput, RouteQueryInput, CreateRouteInput, UpdateRouteInput } from '../validators/map.validator';

/**
 * 地图服务 - 处理客户分布和拜访路线相关的业务逻辑
 */
class MapService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 获取客户分布数据
   */
  async getCustomerDistribution(query: CustomerDistributionQueryInput) {
    const where: any = {};

    if (query.province) {
      where.province = query.province;
    }

    if (query.city) {
      where.city = query.city;
    }

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.hasLocation !== undefined) {
      if (query.hasLocation) {
        where.AND = [
          { lat: { not: null } },
          { lng: { not: null } },
        ];
      }
    }

    const customers = await this.prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        company: true,
        stage: true,
        province: true,
        city: true,
        district: true,
        address: true,
        lat: true,
        lng: true,
        estimatedValue: true,
      },
    });

    // 按省份统计
    const provinceStats = await this.prisma.customer.groupBy({
      by: ['province'],
      where: { province: { not: null } },
      _count: true,
      _sum: { estimatedValue: true },
    });

    // 按城市统计
    const cityStats = await this.prisma.customer.groupBy({
      by: ['city'],
      where: { city: { not: null } },
      _count: true,
      _sum: { estimatedValue: true },
    });

    return {
      customers,
      statistics: {
        byProvince: provinceStats.map(s => ({
          province: s.province,
          count: s._count,
          totalValue: Number(s._sum.estimatedValue) || 0,
        })),
        byCity: cityStats.map(s => ({
          city: s.city,
          count: s._count,
          totalValue: Number(s._sum.estimatedValue) || 0,
        })),
      },
    };
  }

  /**
   * 获取拜访路线列表
   */
  async getRoutes(query: RouteQueryInput) {
    const where: any = {};

    if (query.memberId) {
      where.memberId = query.memberId;
    }

    if (query.date) {
      const startDate = new Date(query.date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    // 由于没有专门的Route模型，这里模拟返回数据
    // 实际项目中应该有专门的拜访路线表
    const tasks = await this.prisma.scheduleTask.findMany({
      where: {
        ...where,
        type: 'visit',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            lat: true,
            lng: true,
            address: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return tasks;
  }

  /**
   * 创建拜访路线
   */
  async createRoute(data: CreateRouteInput, userId: string) {
    // 获取客户信息
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: data.customerIds } },
      select: { id: true, name: true, lat: true, lng: true },
    });

    // 为每个客户创建拜访任务
    const tasks = await Promise.all(
      customers.map((customer, index) =>
        this.prisma.scheduleTask.create({
          data: {
            customerId: customer.id,
            title: `拜访 ${customer.name}`,
            type: 'visit',
            priority: 'medium',
            dueDate: new Date(data.date),
            assigneeId: data.memberId,
            createdById: userId,
            notes: `${data.name} - 第${index + 1}站`,
          },
          include: {
            customer: {
              select: { id: true, name: true, company: true, lat: true, lng: true, address: true },
            },
          },
        })
      )
    );

    return {
      name: data.name,
      date: data.date,
      tasks,
    };
  }

  /**
   * 更新拜访路线
   */
  async updateRoute(id: string, data: UpdateRouteInput) {
    // 这里简化处理，实际应该更新相关的任务
    return { id, ...data };
  }

  /**
   * 优化拜访路线
   * 使用简单的最近邻算法进行路线优化
   */
  async optimizeRoute(data: OptimizeRouteInput) {
    // 获取客户位置信息
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: data.customerIds } },
      select: {
        id: true,
        name: true,
        company: true,
        lat: true,
        lng: true,
        address: true,
      },
    });

    if (customers.length < 2) {
      return { optimizedOrder: customers, totalDistance: 0 };
    }

    // 过滤掉没有坐标的客户
    const validCustomers = customers.filter(c => c.lat && c.lng);

    if (validCustomers.length < 2) {
      return {
        optimizedOrder: customers,
        totalDistance: 0,
        warning: '部分客户缺少地理位置信息',
      };
    }

    // 使用最近邻算法优化路线
    const start = data.startLocation || { lat: 0, lng: 0 };
    const optimizedOrder: typeof customers = [];
    const remaining = [...validCustomers];
    let currentLocation = start;
    let totalDistance = 0;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      // 找到最近的下一个客户
      remaining.forEach((customer, index) => {
        const distance = this.calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          customer.lat!,
          customer.lng!
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const nearest = remaining.splice(nearestIndex, 1)[0];
      optimizedOrder.push(nearest);
      totalDistance += nearestDistance;
      currentLocation = { lat: nearest.lat!, lng: nearest.lng! };
    }

    // 如果有结束位置，计算到结束位置的距离
    if (data.endLocation) {
      totalDistance += this.calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        data.endLocation.lat,
        data.endLocation.lng
      );
    }

    return {
      optimizedOrder,
      totalDistance: Math.round(totalDistance * 100) / 100,
      estimatedTime: Math.round(totalDistance / 30), // 假设平均速度30km/h
    };
  }

  /**
   * 计算两点之间的距离（使用Haversine公式）
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * 获取热力图数据
   */
  async getHeatmapData() {
    const customers = await this.prisma.customer.findMany({
      where: {
        AND: [
          { lat: { not: null } },
          { lng: { not: null } },
        ],
      },
      select: {
        lat: true,
        lng: true,
        estimatedValue: true,
      },
    });

    return customers.map(c => ({
      lat: c.lat,
      lng: c.lng,
      weight: Math.log(Number(c.estimatedValue) || 10000) / 10, // 使用对数作为权重
    }));
  }

  /**
   * 获取区域统计
   */
  async getRegionStats() {
    const [provinceData, cityData] = await Promise.all([
      this.prisma.customer.groupBy({
        by: ['province'],
        where: { province: { not: null } },
        _count: true,
        _sum: { estimatedValue: true },
      }),
      this.prisma.customer.groupBy({
        by: ['city', 'province'],
        where: { city: { not: null } },
        _count: true,
        _sum: { estimatedValue: true },
      }),
    ]);

    return {
      provinces: provinceData.map(p => ({
        name: p.province,
        count: p._count,
        value: Number(p._sum.estimatedValue) || 0,
      })),
      cities: cityData.map(c => ({
        name: c.city,
        province: c.province,
        count: c._count,
        value: Number(c._sum.estimatedValue) || 0,
      })),
    };
  }
}

export default new MapService();