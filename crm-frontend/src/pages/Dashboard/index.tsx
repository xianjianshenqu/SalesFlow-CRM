import { getActiveCustomers, getCustomerColor } from '../../data/customers';
import { mockOpportunities, getStageStats } from '../../data/opportunities';
import { getPaymentStats } from '../../data/payments';
import { STAGE_LABELS, type Stage } from '../../types';
import { FollowUpWidget } from '../../components/AI';

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 统计卡片组件
function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  iconBgColor 
}: { 
  title: string; 
  value: string; 
  change?: string;
  icon: string;
  iconBgColor: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {change && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {change}
            </p>
          )}
        </div>
        <div className={`size-12 rounded-xl ${iconBgColor} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// AI建议横幅组件
function AISuggestionBanner() {
  return (
    <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">AI 智能建议</h3>
          <p className="text-white/80 text-sm mt-1">
            建议今天优先跟进华为和宁德时代项目，本周预期可成交 ¥1,930,000
          </p>
        </div>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
          查看详情
        </button>
      </div>
    </div>
  );
}

// 销售漏斗概览组件
function FunnelOverview() {
  const stageStats = getStageStats();
  const totalValue = mockOpportunities.reduce((sum, o) => sum + o.value, 0);
  
  const stages: Exclude<Stage, 'won'>[] = ['new_lead', 'contacted', 'solution', 'negotiation'];
  const stageColors: Record<Exclude<Stage, 'won'>, string> = {
    new_lead: 'bg-slate-500',
    contacted: 'bg-indigo-500',
    solution: 'bg-blue-500',
    negotiation: 'bg-amber-500'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">销售漏斗概览</h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          总价值: {formatCurrency(totalValue)}
        </span>
      </div>
      
      <div className="space-y-3">
        {stages.map((stage) => {
          const stat = stageStats.find(s => s.stage === stage);
          const percentage = totalValue > 0 ? ((stat?.value || 0) / totalValue) * 100 : 0;
          return (
            <div key={stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">{STAGE_LABELS[stage]}</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {stat?.count || 0} 个机会 · {formatCurrency(stat?.value || 0)}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${stageColors[stage]} rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// AI录音分析列表
function AIRecordingList() {
  const recordings = [
    {
      id: 'r1',
      customerName: '华为技术有限公司',
      customerShortName: 'HW',
      duration: '15:32',
      sentiment: 'positive' as const,
      summary: '客户对方案表示认可，需要进一步讨论价格细节'
    },
    {
      id: 'r2', 
      customerName: '阿里巴巴集团',
      customerShortName: 'AL',
      duration: '23:45',
      sentiment: 'neutral' as const,
      summary: '技术需求已明确，等待内部审批流程'
    },
    {
      id: 'r3',
      customerName: '宁德时代新能源科技股份有限公司',
      customerShortName: 'ND',
      duration: '18:20',
      sentiment: 'positive' as const,
      summary: '商务条款谈判顺利，预计下周签约'
    }
  ];

  const sentimentColors = {
    positive: 'text-emerald-500',
    neutral: 'text-slate-400',
    negative: 'text-red-500'
  };

  const sentimentIcons = {
    positive: 'sentiment_satisfied',
    neutral: 'sentiment_neutral',
    negative: 'sentiment_dissatisfied'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">AI 录音分析</h3>
        <button className="text-sm text-primary hover:text-primary/80">查看全部</button>
      </div>
      
      <div className="space-y-4">
        {recordings.map((recording) => {
          const colorClass = getCustomerColor(recording.customerShortName);
          return (
            <div key={recording.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <div className={`size-10 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold text-sm shrink-0`}>
                {recording.customerShortName}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                    {recording.customerName}
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{recording.duration}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {recording.summary}
                </p>
              </div>
              <span className={`material-symbols-outlined text-lg ${sentimentColors[recording.sentiment]}`}>
                {sentimentIcons[recording.sentiment]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 每日日程组件
function DailySchedule() {
  const tasks = [
    {
      id: 't1',
      time: '09:00',
      title: '华为项目进度会议',
      type: 'meeting',
      customer: '华为技术有限公司'
    },
    {
      id: 't2',
      time: '11:00',
      title: '客户拜访 - 阿里巴巴',
      type: 'visit',
      customer: '阿里巴巴集团'
    },
    {
      id: 't3',
      time: '14:00',
      title: '方案评审',
      type: 'task',
      customer: '宁德时代'
    },
    {
      id: 't4',
      time: '16:00',
      title: '电话跟进 - 比亚迪',
      type: 'call',
      customer: '比亚迪股份有限公司'
    }
  ];

  const typeIcons = {
    meeting: 'groups',
    visit: 'location_on',
    task: 'assignment',
    call: 'call'
  };

  const typeColors = {
    meeting: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    visit: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600',
    task: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
    call: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">今日日程</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">2023年10月16日</span>
      </div>
      
      <div className="relative">
        {/* 时间轴 */}
        <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700"></div>
        
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-4 relative">
              {/* 时间点 */}
              <div className="size-2.5 rounded-full bg-primary ring-4 ring-white dark:ring-slate-900 z-10 mt-2"></div>
              
              {/* 内容 */}
              <div className="flex-1 -mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{task.time}</span>
                  <span className={`material-symbols-outlined text-sm ${typeColors[task.type as keyof typeof typeColors]}`}>
                    {typeIcons[task.type as keyof typeof typeIcons]}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{task.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.customer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 客户地图迷你视图
function CustomerMapMini() {
  const cities = [
    { name: '深圳', count: 4, top: '45%', left: '70%' },
    { name: '杭州', count: 1, top: '55%', left: '80%' },
    { name: '北京', count: 2, top: '25%', left: '75%' },
    { name: '宁德', count: 1, top: '60%', left: '82%' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">客户分布</h3>
        <button className="text-sm text-primary hover:text-primary/80">查看地图</button>
      </div>
      
      {/* 地图占位 */}
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-lg overflow-hidden">
        {/* 中国地图轮廓占位 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">map</span>
        </div>
        
        {/* 城市标记点 */}
        {cities.map((city) => (
          <div
            key={city.name}
            className="absolute group cursor-pointer"
            style={{ top: city.top, left: city.left }}
          >
            <div className="size-4 bg-primary rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              <span className="text-[8px] text-white font-bold">{city.count}</span>
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {city.name}
            </div>
          </div>
        ))}
      </div>
      
      {/* 城市列表 */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {cities.map((city) => (
          <div key={city.name} className="flex items-center gap-2 text-sm">
            <div className="size-2 bg-primary rounded-full"></div>
            <span className="text-slate-600 dark:text-slate-400">{city.name}</span>
            <span className="text-slate-900 dark:text-white font-medium">{city.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const activeCustomers = getActiveCustomers();
  const paymentStats = getPaymentStats();
  const totalValue = mockOpportunities.reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">工作台</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">欢迎回来，Alex！今天有 4 个待办事项</p>
      </div>

      {/* AI 建议横幅 */}
      <AISuggestionBanner />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="本月营收"
          value={formatCurrency(paymentStats.totalPaid)}
          change="+12.5% 较上月"
          icon="payments"
          iconBgColor="bg-emerald-500"
        />
        <StatsCard
          title="活跃客户"
          value={activeCustomers.toString()}
          change="+3 本月新增"
          icon="group"
          iconBgColor="bg-blue-500"
        />
        <StatsCard
          title="漏斗价值"
          value={formatCurrency(totalValue)}
          change="7 个活跃机会"
          icon="filter_alt"
          iconBgColor="bg-amber-500"
        />
        <StatsCard
          title="今日拜访"
          value="4"
          change="2 个高优先级"
          icon="event"
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* 中间区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelOverview />
        <AIRecordingList />
      </div>

      {/* 底部区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailySchedule />
        <FollowUpWidget limit={5} onSuggestionClick={(suggestion) => {
          // 可以在这里打开客户详情或话术生成对话框
          console.log('Suggestion clicked:', suggestion);
        }} />
      </div>
    </div>
  );
}