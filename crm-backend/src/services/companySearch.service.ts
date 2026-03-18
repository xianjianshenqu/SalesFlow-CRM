/**
 * 企业信息查询服务
 * 模拟天眼查/企查查等企业信息查询API
 */

// 企业信息接口
export interface CompanyInfo {
  name: string;              // 企业名称
  shortName: string;         // 企业简称
  creditCode: string;        // 统一社会信用代码
  legalPerson: string;       // 法人代表
  registeredCapital: number; // 注册资本（万元）
  establishDate: string;     // 成立日期
  status: string;            // 企业状态
  industry: string;          // 行业
  city: string;              // 城市
  province: string;          // 省份
  address: string;           // 详细地址
  businessScope: string;     // 经营范围
  phone?: string;            // 联系电话
  email?: string;            // 邮箱
}

// 模拟企业数据库
const MOCK_COMPANIES: CompanyInfo[] = [
  {
    name: '华为技术有限公司',
    shortName: '华为',
    creditCode: '914403001922038216',
    legalPerson: '任正非',
    registeredCapital: 4034113.182,
    establishDate: '1987-09-15',
    status: '存续',
    industry: '通信设备',
    city: '深圳',
    province: '广东省',
    address: '深圳市龙岗区坂田华为总部办公楼',
    businessScope: '一般经营项目是：程控交换机、传输设备、数据通信设备、宽带多媒体设备、电源、无线通信设备、微电子产品、软件、系统集成工程、计算机及配套设备、终端设备及相关通信信息产品、数据中心机房基础设施及配套产品（含供配电、暖通、智控等）的开发、生产、销售、技术服务、工程安装、维修、咨询、代理、租赁；信息系统设计、集成、运行维护；集成电路设计、研发；统一通信及协作类产品、服务器及配套软硬件产品、存储设备及相关软件的研发、生产、销售、技术服务、工程安装、维修、咨询、代理、租赁；智能建筑、智慧城市、智慧交通、智慧能源相关产品的研发、生产、销售、技术服务、工程安装、维修、咨询、代理、租赁；汽车零部件及电子产品的研发、生产、销售、技术服务、工程安装、维修、咨询、代理、租赁；云计算、大数据、人工智能、物联网相关产品的研发、生产、销售、技术服务、工程安装、维修、咨询、代理、租赁。',
    phone: '0755-28780808',
    email: 'contact@huawei.com'
  },
  {
    name: '腾讯科技有限公司',
    shortName: '腾讯',
    creditCode: '91440300708461136C',
    legalPerson: '马化腾',
    registeredCapital: 200,
    establishDate: '2000-02-24',
    status: '存续',
    industry: '互联网',
    city: '深圳',
    province: '广东省',
    address: '深圳市南山区高新区科技中一路腾讯大厦35层',
    businessScope: '一般经营项目是：计算机软、硬件的设计、技术开发、销售（不含专营、专控、专卖商品及限制项目）；数据库及计算机网络服务；国内商业、物资供销业（不含专营、专控、专卖商品）；从事广告业务（法律、行政法规规定应进行广告经营审批等级的，需取得审批后方可经营）；网络游戏出版运营；货物及技术进出口。',
    phone: '0755-86013388',
    email: 'service@tencent.com'
  },
  {
    name: '阿里巴巴（中国）有限公司',
    shortName: '阿里巴巴',
    creditCode: '91330100799655058B',
    legalPerson: '张勇',
    registeredCapital: 154600,
    establishDate: '2007-03-26',
    status: '存续',
    industry: '互联网',
    city: '杭州',
    province: '浙江省',
    address: '浙江省杭州市滨江区长河街道网商路699号4号楼5楼501室',
    businessScope: '企业管理，计算机系统服务，电脑数据处理，计算机软件的生产（含技术开发），销售自产产品，自有房屋租赁。',
    phone: '0571-85022088',
    email: 'service@alibaba.com'
  },
  {
    name: '字节跳动科技有限公司',
    shortName: '字节跳动',
    creditCode: '91110105MA005XDM5J',
    legalPerson: '张利东',
    registeredCapital: 1000,
    establishDate: '2016-05-04',
    status: '存续',
    industry: '互联网',
    city: '北京',
    province: '北京市',
    address: '北京市海淀区北三环西路43号中航广场1号楼',
    businessScope: '技术开发、技术推广、技术转让、技术咨询、技术服务、技术推广；计算机系统服务；数据处理（数据处理中的银行卡中心、PUE值在1.5以上的云计算数据中心除外）；基础软件服务；应用软件服务（不含医用软件）；设计、制作、代理、发布广告；从事互联网文化活动；出版物零售；广播电视节目制作。',
    phone: '010-58895588',
    email: 'contact@bytedance.com'
  },
  {
    name: '小米科技有限责任公司',
    shortName: '小米',
    creditCode: '91110108558521649E',
    legalPerson: '雷军',
    registeredCapital: 185000,
    establishDate: '2010-03-03',
    status: '存续',
    industry: '消费电子',
    city: '北京',
    province: '北京市',
    address: '北京市海淀区西二旗中路33号院6号楼8层018号',
    businessScope: '技术开发；销售通讯设备、厨房用具、卫生用品、日用杂货、化妆品、医疗器械I类、II类、家用电器、针纺织品、服装、鞋帽、礼品、文化用品、体育用品、玩具、乐器、照相器材、金银制品、首饰、工艺品、钟表、眼镜、箱包、家具、灯具、装饰材料、建筑材料、卫生间用具、橡胶制品、塑料制品、化工产品（不含危险化学品及一类易制毒化学品）、电子产品、五金交电；货物进出口、技术进出口、代理进出口。',
    phone: '010-60606666',
    email: 'service@xiaomi.com'
  },
  {
    name: '京东世纪贸易有限公司',
    shortName: '京东',
    creditCode: '91110112600007333F',
    legalPerson: '徐雷',
    registeredCapital: 139100,
    establishDate: '2003-04-09',
    status: '存续',
    industry: '电商',
    city: '北京',
    province: '北京市',
    address: '北京市北京经济技术开发区科创十一街18号C座2层201室',
    businessScope: '销售食品；零售图书、电子出版物；销售家用电器、电子元器件、五金交电、电子产品、文化用品、照相器材、计算机、软件及辅助设备、化妆品及卫生用品、化工产品（不含危险化学品及一类易制毒化学品）、体育用品、百货、邮票、纺织品、服装、日用品、家具、金银珠宝首饰、新鲜水果、蔬菜、饲料、花卉、种子、装饰材料、通讯设备、建筑材料、工艺礼品、钟表眼镜、玩具、汽车和摩托车配件、机器人、仪器仪表、卫生洁具、陶瓷制品、橡胶及塑料制品、摩托车、化肥、农药；货物进出口；代理进出口；技术进出口。',
    phone: '400-606-5500',
    email: 'service@jd.com'
  },
  {
    name: '百度在线网络技术有限公司',
    shortName: '百度',
    creditCode: '91110108717743463F',
    legalPerson: '李彦宏',
    registeredCapital: 4520,
    establishDate: '2000-06-05',
    status: '存续',
    industry: '互联网',
    city: '北京',
    province: '北京市',
    address: '北京市海淀区上地十街10号百度大厦三层',
    businessScope: '开发、生产计算机软件；提供相关技术咨询、技术服务、技术培训；承接计算机网络系统工程；计算机系统集成；销售自产产品；设计、制作、代理、发布广告；货物进出口、技术进出口、代理进出口。',
    phone: '010-59928888',
    email: 'contact@baidu.com'
  },
  {
    name: '美团科技有限公司',
    shortName: '美团',
    creditCode: '91110108580815533K',
    legalPerson: '穆荣均',
    registeredCapital: 44.8,
    establishDate: '2011-11-03',
    status: '存续',
    industry: '本地生活',
    city: '北京',
    province: '北京市',
    address: '北京市朝阳区望京东路6号6号楼5层501室',
    businessScope: '技术开发、技术服务、技术转让、技术咨询；经济贸易咨询；组织文化艺术交流活动（不含营业性演出）；会议服务；企业管理咨询；计算机系统服务；应用软件服务；基础软件服务；设计、制作、代理、发布广告；销售计算机、软件及辅助设备、电子产品；火车票销售代理；航空机票销售代理；经营电信业务；互联网信息服务。',
    phone: '10107888',
    email: 'service@meituan.com'
  },
  {
    name: '比亚迪股份有限公司',
    shortName: '比亚迪',
    creditCode: '91440300192317458F',
    legalPerson: '王传福',
    registeredCapital: 266000,
    establishDate: '1995-02-10',
    status: '存续',
    industry: '汽车制造',
    city: '深圳',
    province: '广东省',
    address: '深圳市大鹏新区葵涌街道延安路一号',
    businessScope: '锂离子电池及其他电池、充电器、电子产品、仪器仪表、柔性线路板、五金制品、液体洗涤剂、消毒剂（不含危险化学品）、光电子器件及其他电子器件、电子元件及电子元器件、电动工具、电动自行车、电动滑板车、电动平衡车、电动汽车、电动叉车、轨道交通车辆、电车、汽车整车、挂车、汽车车身、汽车底盘、汽车零部件及配件、汽车用发动机、发电机及发电机组、电动机、新能源汽车用电机控制器、新能源汽车用控制器、新能源汽车电驱动系统、新能源汽车关键零部件的研发、生产和销售。',
    phone: '0755-89888888',
    email: 'service@byd.com'
  },
  {
    name: '宁德时代新能源科技股份有限公司',
    shortName: '宁德时代',
    creditCode: '91350900705223570G',
    legalPerson: '曾毓群',
    registeredCapital: 232973.4,
    establishDate: '2011-12-16',
    status: '存续',
    industry: '新能源',
    city: '宁德',
    province: '福建省',
    address: '福建省宁德市蕉城区漳湾镇新港路2号',
    businessScope: '锂离子电池、锂聚合物电池、燃料电池、动力电池、超大容量储能电池、超级电容器、电池管理系统及可充电电池包、风光电储能系统、相关设备仪器的开发、生产和销售及售后服务；对新能源行业的投资；锂电池及相关产品的技术服务、测试服务、咨询服务。',
    phone: '0593-8966666',
    email: 'contemporary@catl.com'
  },
  {
    name: '上海浦东发展银行股份有限公司',
    shortName: '浦发银行',
    creditCode: '913100001322078950',
    legalPerson: '郑杨',
    registeredCapital: 2935208.1,
    establishDate: '1992-10-19',
    status: '存续',
    industry: '银行业',
    city: '上海',
    province: '上海市',
    address: '上海市中山东一路12号',
    businessScope: '吸收公众存款；发放短期、中期和长期贷款；办理结算；办理票据贴现；发行金融债券；代理发行、代理兑付、承销政府债券；买卖政府债券；同业拆借；提供信用证服务及担保；代理收付款项及代理保险业务；提供保管箱服务；外汇存款；外汇贷款；外汇汇款；外币兑换；国际结算；同业外汇拆借；外汇票据的承兑和贴现；外汇借款；外汇担保；结汇、售汇；买卖和代理买卖股票以外的外币有价证券；自营外汇买卖；代客外汇买卖；资信调查、咨询、见证业务；离岸银行业务；证券投资基金托管业务；全国社会保障基金托管业务；经中国人民银行批准经营的其他业务。',
    phone: '021-63611234',
    email: 'service@spdb.com.cn'
  },
  {
    name: '中国平安保险（集团）股份有限公司',
    shortName: '平安保险',
    creditCode: '91440300100012316L',
    legalPerson: '谢永林',
    registeredCapital: 1828093.8,
    establishDate: '1988-03-21',
    status: '存续',
    industry: '保险业',
    city: '深圳',
    province: '广东省',
    address: '深圳市福田区益田路5033号平安金融中心47、48、109、110、111、112层',
    businessScope: '投资保险企业；监督管理控股投资企业的各种国内、国际业务；开展保险资金运用业务；经批准开展国内、国际保险业务；经中国保险监督管理委员会及国家有关部门批准的其他业务。',
    phone: '95511',
    email: 'pingan@pingan.com'
  },
  {
    name: '新希望六和股份有限公司',
    shortName: '新希望',
    creditCode: '91510100201891237X',
    legalPerson: '刘畅',
    registeredCapital: 451344.8,
    establishDate: '1998-03-04',
    status: '存续',
    industry: '农牧业',
    city: '成都',
    province: '四川省',
    address: '四川省成都市武侯区人民南路4段45号希望大厦',
    businessScope: '饲料加工、销售；畜禽养殖、销售；畜禽屠宰、销售；肉制品加工、销售；食用油脂加工、销售；粮油加工、销售；进出口业务。',
    phone: '028-85258888',
    email: 'nhhd@newhope.com'
  },
  {
    name: '格力电器股份有限公司',
    shortName: '格力',
    creditCode: '91440400192541650K',
    legalPerson: '董明珠',
    registeredCapital: 553653.5,
    establishDate: '1989-12-13',
    status: '存续',
    industry: '家电',
    city: '珠海',
    province: '广东省',
    address: '珠海市前山金鸡西路六号',
    businessScope: '货物、技术的进出口；研发、制造、销售：电冰箱、洗衣机、空调器、电风扇、吸尘器、热水器、炉具、抽油烟机、电熨斗、电吹风、取暖器具、电饭煲、电烤箱、微波炉、饮水机、净水设备、加湿器、空气清新机、电风扇、排风扇、换气扇、新风机、干燥器、除湿机、电暖器、电热毯、按摩椅、电子血压计、电子体温计、血糖仪、家用电力器具、商用电器、厨房电器、保健电器、仪器仪表、办公设备、通讯设备、机电设备、电子元器件、五金交电、塑料制品、模具、铸件；商业的批发、零售；普通货运。',
    phone: '0756-8614888',
    email: 'gree@gree.com'
  },
  {
    name: '海尔智家股份有限公司',
    shortName: '海尔',
    creditCode: '91370200163572079E',
    legalPerson: '梁海山',
    registeredCapital: 945349.9,
    establishDate: '1984-04-01',
    status: '存续',
    industry: '家电',
    city: '青岛',
    province: '山东省',
    address: '青岛市崂山区海尔路1号海尔工业园内',
    businessScope: '电冰箱、电冰柜、洗衣机、空调器、电热水器、燃气热水器、微波炉、电烤箱、电磁炉、电饭煲、吸尘器、吸排油烟机、燃气灶、消毒柜、饮水机、净水器、电熨斗、电吹风、换气扇、电风扇、空气清新机、加湿器、电暖器、电热毯、小家电、其他家用电器、家用电器配件、模具、塑料制品、五金制品、电子产品的研发、制造、销售、安装、维修；自有房屋出租。',
    phone: '0532-88938888',
    email: 'haier@haier.com'
  }
];

export class CompanySearchService {
  /**
   * 搜索企业
   * @param keyword 搜索关键词
   * @param limit 返回数量限制
   */
  async searchCompanies(keyword: string, limit: number = 10): Promise<CompanyInfo[]> {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }

    const searchTerm = keyword.trim().toLowerCase();
    
    // 模拟搜索延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    // 搜索匹配：企业名称、简称、统一社会信用代码
    const results = MOCK_COMPANIES.filter(company => 
      company.name.toLowerCase().includes(searchTerm) ||
      company.shortName.toLowerCase().includes(searchTerm) ||
      company.creditCode.includes(searchTerm)
    );

    return results.slice(0, limit);
  }

  /**
   * 根据统一社会信用代码获取企业详情
   * @param creditCode 统一社会信用代码
   */
  async getCompanyByCreditCode(creditCode: string): Promise<CompanyInfo | null> {
    if (!creditCode) {
      return null;
    }

    // 模拟查询延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return MOCK_COMPANIES.find(company => company.creditCode === creditCode) || null;
  }

  /**
   * 根据名称获取企业详情
   * @param name 企业名称
   */
  async getCompanyByName(name: string): Promise<CompanyInfo | null> {
    if (!name) {
      return null;
    }

    // 模拟查询延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return MOCK_COMPANIES.find(company => 
      company.name === name || company.shortName === name
    ) || null;
  }
}

export default new CompanySearchService();