import { mockCustomers, getCustomerColor } from '../../data/customers';

// 客户分布Mock数据
const cityData = [
  { city: '深圳', count: 4, top: '45%', left: '68%', customers: ['华为技术有限公司', '腾讯科技（深圳）有限公司', '比亚迪股份有限公司', '中国平安保险（集团）股份有限公司'] },
  { city: '杭州', count: 1, top: '52%', left: '75%', customers: ['阿里巴巴集团'] },
  { city: '北京', count: 2, top: '22%', left: '72%', customers: ['美团点评', '百度在线网络技术（北京）有限公司'] },
  { city: '宁德', count: 1, top: '58%', left: '78%', customers: ['宁德时代新能源科技股份有限公司'] }
];

// 拜访路线Mock数据
const visitRoutes = [
  { id: 1, customer: '华为技术有限公司', time: '09:00', status: 'planned' },
  { id: 2, customer: '阿里巴巴集团', time: '14:00', status: 'planned' },
  { id: 3, customer: '比亚迪股份有限公司', time: '16:30', status: 'planned' }
];

// 地区分布统计
function RegionStats() {
  const regions = [
    { name: '华南地区', count: 5, value: 3950000, color: 'bg-blue-500' },
    { name: '华东地区', count: 1, value: 850000, color: 'bg-emerald-500' },
    { name: '华北地区', count: 2, value: 870000, color: 'bg-amber-500' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">地区分布统计</h3>
      <div className="space-y-4">
        {regions.map((region) => (
          <div key={region.name} className="flex items-center gap-3">
            <div className={`size-3 rounded-full ${region.color}`}></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{region.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{region.count} 客户</span>
              </div>
              <div className="mt-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${region.color} rounded-full`}
                  style={{ width: `${(region.count / 8) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 拜访路线侧边栏
function VisitRouteSidebar() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">今日拜访路线</h3>
        <button className="text-sm text-primary hover:text-primary/80">优化路线</button>
      </div>
      <div className="space-y-4">
        {visitRoutes.map((route, index) => {
          const customer = mockCustomers.find(c => c.name === route.customer);
          const colorClass = customer ? getCustomerColor(customer.shortName) : { bg: 'bg-slate-100', text: 'text-slate-600' };
          
          return (
            <div key={route.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                {index < visitRoutes.length - 1 && (
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 my-1"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`size-8 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center text-xs font-medium`}>
                    {customer?.shortName}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{route.customer}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{route.time}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 路线统计 */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">预计行程</span>
          <span className="font-medium text-slate-900 dark:text-white">约 4.5 小时</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-slate-500 dark:text-slate-400">总里程</span>
          <span className="font-medium text-slate-900 dark:text-white">约 280 公里</span>
        </div>
      </div>
    </div>
  );
}

// 客户列表
function CustomerListPanel() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">客户列表</h3>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
        {mockCustomers.map((customer) => {
          const colorClass = getCustomerColor(customer.shortName);
          return (
            <div key={customer.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold text-sm`}>
                  {customer.shortName}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{customer.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{customer.city} · {customer.industry}</p>
                </div>
                <span className="material-symbols-outlined text-slate-400">location_on</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Map() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">客户地图</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">查看客户地理分布，规划拜访路线</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">route</span>
            规划路线
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">add_location</span>
            添加标记
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 地图视图 */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* 地图占位 */}
            <div className="relative h-[500px] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              {/* 中国地图轮廓占位 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-8xl text-slate-300 dark:text-slate-700">map</span>
                  <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">地图视图</p>
                </div>
              </div>
              
              {/* 城市标记点 */}
              {cityData.map((city) => (
                <div
                  key={city.city}
                  className="absolute group cursor-pointer"
                  style={{ top: city.top, left: city.left }}
                >
                  <div className="relative">
                    {/* 脉冲动画 */}
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30"></div>
                    {/* 标记点 */}
                    <div className="relative size-8 bg-primary rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-lg">
                      <span className="text-xs text-white font-bold">{city.count}</span>
                    </div>
                  </div>
                  {/* 悬停提示 */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    <p className="font-semibold">{city.city}</p>
                    <p className="text-slate-300">{city.count} 个客户</p>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {city.customers.slice(0, 2).map((c, i) => (
                        <p key={i} className="truncate">{c}</p>
                      ))}
                      {city.customers.length > 2 && <p>+{city.customers.length - 2} 更多</p>}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 图例 */}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg p-3 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">图例</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="size-3 bg-primary rounded-full"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">客户位置</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="size-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">今日拜访</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          <VisitRouteSidebar />
          <RegionStats />
        </div>
      </div>

      {/* 客户列表 */}
      <CustomerListPanel />
    </div>
  );
}