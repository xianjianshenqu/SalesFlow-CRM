// 团队成员Mock数据
const mockTeamMembers = [
  { id: '1', name: 'Alex Chen', role: '销售经理', department: '企业销售部', revenue: 2850000, deals: 12, activities: 156, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7V0G3LOBXMmra5NcyxKWwA2mjirmBLHljZahivlXMtB5KNOEC67SfxwT1UeKdVkylAW-UPF2CDVWCGlykjFu35B1VIsBaAgZ0Zeq7QNrC2M6Y06NDWYBwKKZQCkF4e0GvzuB6Tc6h6Gg2Gj4NUE6adMnSkD7ZBAvZztq_hwRwtji0lgSpiUj3JPSPcJIu87orKlQaKBG7Cf3SnsLbwXwyZNJu3XF5a9gwtzl9rTgi7PAZJ0XRzExYWnqzQY4QkI_nFGkOE_8ae-Y' },
  { id: '2', name: 'Sarah Wang', role: '高级销售代表', department: '企业销售部', revenue: 1920000, deals: 8, activities: 134, avatar: null },
  { id: '3', name: 'Mike Liu', role: '销售代表', department: '中小企业部', revenue: 1280000, deals: 6, activities: 98, avatar: null },
  { id: '4', name: 'Emily Zhang', role: '销售代表', department: '中小企业部', revenue: 980000, deals: 5, activities: 87, avatar: null },
  { id: '5', name: 'David Li', role: '销售代表', department: '渠道销售部', revenue: 750000, deals: 4, activities: 76, avatar: null },
  { id: '6', name: 'Linda Wu', role: '初级销售', department: '渠道销售部', revenue: 420000, deals: 3, activities: 54, avatar: null }
];

// 团队动态Mock数据
const teamActivities = [
  { id: '1', user: 'Alex Chen', action: '完成签约', customer: '中国平安保险', time: '10分钟前', type: 'deal' },
  { id: '2', user: 'Sarah Wang', action: '创建方案', customer: '宁德时代', time: '25分钟前', type: 'proposal' },
  { id: '3', user: 'Mike Liu', action: '客户拜访', customer: '美团点评', time: '1小时前', type: 'visit' },
  { id: '4', user: 'Emily Zhang', action: '跟进电话', customer: '比亚迪', time: '2小时前', type: 'call' },
  { id: '5', user: 'David Li', action: '新增线索', customer: '小米科技', time: '3小时前', type: 'lead' }
];

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 奖台组件
function Podium() {
  const top3 = mockTeamMembers.slice(0, 3);
  const positions = [
    { rank: 2, height: 'h-32', color: 'bg-slate-200 dark:bg-slate-700', medal: '🥈', member: top3[1] },
    { rank: 1, height: 'h-40', color: 'bg-amber-400', medal: '🥇', member: top3[0] },
    { rank: 3, height: 'h-24', color: 'bg-amber-700', medal: '🥉', member: top3[2] }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-6">本月业绩排行</h3>
      <div className="flex items-end justify-center gap-4">
        {positions.map((pos) => (
          <div key={pos.rank} className="flex flex-col items-center">
            {/* 头像 */}
            <div className="relative mb-2">
              <div className="size-14 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-lg">
                {pos.member?.avatar ? (
                  <img src={pos.member.avatar} alt={pos.member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-medium text-slate-600 dark:text-slate-300">
                    {pos.member?.name[0]}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 text-xl">{pos.medal}</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{pos.member?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(pos.member?.revenue || 0)}</p>
            
            {/* 领奖台 */}
            <div className={`w-20 ${pos.height} ${pos.color} rounded-t-lg mt-2 flex items-center justify-center`}>
              <span className="text-2xl font-bold text-white">{pos.rank}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 排名表格
function RankingTable() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">销售代表排名</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">排名</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">成员</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">业绩</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">成交数</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">活动数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {mockTeamMembers.map((member, index) => (
              <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-600' :
                    index === 1 ? 'bg-slate-100 text-slate-600' :
                    index === 2 ? 'bg-amber-700/20 text-amber-700' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(member.revenue)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 dark:text-slate-400">{member.deals} 笔</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 dark:text-slate-400">{member.activities} 次</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 团队统计卡片
function TeamStats() {
  const totalRevenue = mockTeamMembers.reduce((sum, m) => sum + m.revenue, 0);
  const totalDeals = mockTeamMembers.reduce((sum, m) => sum + m.deals, 0);
  const totalActivities = mockTeamMembers.reduce((sum, m) => sum + m.activities, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">团队总业绩</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">成交总数</p>
        <p className="text-2xl font-bold text-emerald-500 mt-1">{totalDeals} 笔</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">团队活动</p>
        <p className="text-2xl font-bold text-blue-500 mt-1">{totalActivities} 次</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">人均业绩</p>
        <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(totalRevenue / mockTeamMembers.length)}</p>
      </div>
    </div>
  );
}

// 实时动态
function ActivityFeed() {
  const activityIcons = {
    deal: { icon: 'handshake', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    proposal: { icon: 'description', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    visit: { icon: 'location_on', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    call: { icon: 'call', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    lead: { icon: 'person_add', color: 'text-primary', bg: 'bg-primary/10' }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">实时动态</h3>
        <div className="flex items-center gap-1">
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-500 dark:text-slate-400">实时更新</span>
        </div>
      </div>
      <div className="space-y-4">
        {teamActivities.map((activity) => {
          const config = activityIcons[activity.type as keyof typeof activityIcons];
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`size-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-sm ${config.color}`}>{config.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-white">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}{' '}
                  <span className="text-primary">{activity.customer}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">团队协作</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">查看团队业绩排行和实时动态</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-sm">group_add</span>
          邀请成员
        </button>
      </div>

      {/* 统计卡片 */}
      <TeamStats />

      {/* 奖台 */}
      <Podium />

      {/* 排名表格和实时动态 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RankingTable />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}