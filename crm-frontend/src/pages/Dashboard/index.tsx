import { getActiveCustomers, getCustomerColor } from '../../data/customers';
import { mockOpportunities, getStageStats } from '../../data/opportunities';
import { getPaymentStats } from '../../data/payments';
import { STAGE_LABELS, type Stage } from '../../types';
import { FollowUpWidget } from '../../components/AI';
import { useState, useEffect } from 'react';
import type { ScoreSummary, ChurnAlert } from '../../types';

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 统计卡片组件 - Luxury Dark Theme
function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  gradient,
  delay = 0
}: { 
  title: string; 
  value: string; 
  change?: string;
  icon: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <div 
      className="group relative rounded-2xl p-6 overflow-hidden fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl"></div>
      
      {/* Gradient glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient} blur-2xl`}></div>

      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-gray-700/30 group-hover:border-gray-600/50 transition-colors"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-300 font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2 font-['Outfit']">{value}</p>
            {change && (
              <p className="text-xs text-emerald-300 mt-3 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                {change}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <span className="material-symbols-outlined text-white">{icon}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// AI建议横幅组件 - Luxury Dark Theme
function AISuggestionBanner() {
  return (
    <div className="relative rounded-2xl overflow-hidden fade-in-up stagger-1">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-cyan-500/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/60 backdrop-blur-xl"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer"></div>
      
      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-amber-500/20"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-white font-['Outfit']">AI 智能建议</h3>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">NEW</span>
            </div>
            <p className="text-gray-400 text-sm">
              建议今天优先跟进华为和宁德时代项目，本周预期可成交 <span className="text-amber-400 font-semibold">¥1,930,000</span>
            </p>
          </div>
          <button className="group px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-sm font-semibold text-gray-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all">
            查看详情
            <span className="material-symbols-outlined text-sm ml-1 inline-block group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 销售漏斗概览组件 - Luxury Dark Theme
function FunnelOverview() {
  const stageStats = getStageStats();
  const totalValue = mockOpportunities.reduce((sum, o) => sum + o.value, 0);
  
  const stages: Exclude<Stage, 'won'>[] = ['new_lead', 'contacted', 'solution', 'quoted', 'negotiation', 'procurement_process', 'contract_stage'];
  const stageColors: Record<Exclude<Stage, 'won'>, { bg: string; gradient: string }> = {
    new_lead: { bg: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' },
    contacted: { bg: 'bg-cyan-500', gradient: 'from-cyan-500 to-cyan-600' },
    solution: { bg: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600' },
    quoted: { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600' },
    negotiation: { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
    procurement_process: { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600' },
    contract_stage: { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden fade-in-up stagger-2">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center border border-amber-500/20">
              <span className="material-symbols-outlined text-amber-400">filter_alt</span>
            </div>
            <h3 className="font-semibold text-white font-['Outfit']">销售漏斗概览</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/30">
            <span className="text-xs text-gray-300">总价值</span>
            <span className="text-sm font-semibold text-amber-300">{formatCurrency(totalValue)}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const stat = stageStats.find(s => s.stage === stage);
            const percentage = totalValue > 0 ? ((stat?.value || 0) / totalValue) * 100 : 0;
            return (
              <div key={stage} className="group">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stageColors[stage].gradient}`}></div>
                    <span className="text-gray-200 group-hover:text-white transition-colors font-medium">{STAGE_LABELS[stage]}</span>
                  </div>
                  <span className="font-medium text-white">
                    {stat?.count || 0} <span className="text-gray-300 text-xs">个机会</span> · <span className="text-amber-300">{formatCurrency(stat?.value || 0)}</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${stageColors[stage].gradient} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%`, transitionDelay: `${index * 100}ms` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// AI录音分析列表 - Luxury Dark Theme
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
    positive: 'text-emerald-400',
    neutral: 'text-gray-400',
    negative: 'text-red-400'
  };

  const sentimentIcons = {
    positive: 'sentiment_satisfied',
    neutral: 'sentiment_neutral',
    negative: 'sentiment_dissatisfied'
  };

  const sentimentBgColors = {
    positive: 'bg-emerald-500/10 border-emerald-500/20',
    neutral: 'bg-gray-500/10 border-gray-500/20',
    negative: 'bg-red-500/10 border-red-500/20'
  };

  return (
    <div className="relative rounded-2xl overflow-hidden fade-in-up stagger-3">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center border border-cyan-500/20">
              <span className="material-symbols-outlined text-cyan-400">settings_voice</span>
            </div>
            <h3 className="font-semibold text-white font-['Outfit']">AI 录音分析</h3>
          </div>
          <button className="group flex items-center gap-1 text-sm text-amber-300 hover:text-amber-200 transition-colors font-medium">
            查看全部
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {recordings.map((recording) => {
            const colorClass = getCustomerColor(recording.customerShortName);
            return (
              <div key={recording.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-800/30 transition-all cursor-pointer border border-transparent hover:border-gray-700/30">
                <div className={`w-10 h-10 rounded-xl ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold text-sm shrink-0 border border-gray-700/30`}>
                  {recording.customerShortName}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-100 text-sm truncate group-hover:text-amber-300 transition-colors">
                      {recording.customerName}
                    </p>
                    <span className="text-xs text-gray-400 font-mono">{recording.duration}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                    {recording.summary}
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-lg ${sentimentBgColors[recording.sentiment]} flex items-center justify-center border`}>
                  <span className={`material-symbols-outlined text-lg ${sentimentColors[recording.sentiment]}`}>
                    {sentimentIcons[recording.sentiment]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 每日日程组件 - Luxury Dark Theme
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
    meeting: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
    visit: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
    task: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-400' },
    call: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'text-purple-400' }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden fade-in-up stagger-5">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl border border-gray-700/30 rounded-2xl"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/20">
              <span className="material-symbols-outlined text-purple-400">calendar_today</span>
            </div>
            <div>
              <h3 className="font-semibold text-white font-['Outfit']">今日日程</h3>
              <p className="text-xs text-gray-300">2023年10月16日 星期一</p>
            </div>
          </div>
          <button className="w-8 h-8 rounded-lg bg-gray-800/50 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
        
        <div className="relative">
          {/* 时间轴 */}
          <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700"></div>
          
          <div className="space-y-4">
            {tasks.map((task, index) => {
              const colors = typeColors[task.type as keyof typeof typeColors];
              return (
                <div key={task.id} className="group flex items-start gap-4 relative cursor-pointer">
                  {/* 时间点 */}
                  <div className="relative z-10">
                    <div className="w-4 h-4 rounded-full bg-gray-900 border-2 border-amber-500/50 group-hover:border-amber-400 group-hover:scale-110 transition-all mt-1"></div>
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1 -mt-1 p-3 rounded-xl hover:bg-gray-800/30 transition-all border border-transparent hover:border-gray-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-300">{task.time}</span>
                      <div className={`w-5 h-5 rounded ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-[10px] ${colors.icon}`}>
                          {typeIcons[task.type as keyof typeof typeIcons]}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-100 group-hover:text-amber-300 transition-colors">{task.title}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{task.customer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 客户地图迷你视图
export function _CustomerMapMini() {
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

// 商机评分概览组件
function OpportunityScoreOverview() {
  const [scoreSummary, setScoreSummary] = useState<ScoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { getScoreSummary } = await import('../../services/aiService');
        const data = await getScoreSummary();
        setScoreSummary(data);
      } catch (err) {
        console.error('获取评分概览失败:', err);
        setError('暂无数据');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  // 显示空状态或错误状态
  if (!scoreSummary || error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            商机评分概览
          </h3>
        </div>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">analytics</span>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{error || '暂无商机评分数据'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">请先在销售漏斗中为商机生成评分</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          商机评分概览
        </h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {scoreSummary.scoredOpportunities}/{scoreSummary.totalOpportunities} 已评分
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">{scoreSummary.averageScore}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">平均评分</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-500">{scoreSummary.highScoreCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">高分商机</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-500">{formatCurrency(scoreSummary.predictedValue)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">预测成交</p>
        </div>
      </div>

      {scoreSummary.topOpportunities.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Top商机</p>
          {scoreSummary.topOpportunities.slice(0, 3).map((opp) => (
            <div key={opp.opportunityId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                  {opp.customerName}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  opp.overallScore >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  opp.overallScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {opp.overallScore}分
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400">{formatCurrency(opp.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 流失预警小组件
function ChurnAlertWidget() {
  const [alerts, setAlerts] = useState<ChurnAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { getChurnAlerts } = await import('../../services/aiService');
        const data = await getChurnAlerts({ riskLevel: 'high', limit: 5 });
        setAlerts(data.items);
      } catch (error) {
        console.error('获取流失预警失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const highRiskCount = alerts.filter(a => a.riskLevel === 'high').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">warning</span>
          流失预警
        </h3>
        {highRiskCount > 0 && (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium">
            {highRiskCount} 个高风险
          </span>
        )}
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${
                  alert.riskLevel === 'high' ? 'bg-red-500' :
                  alert.riskLevel === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {alert.customer?.name || '未知客户'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    风险分: {alert.riskScore}
                  </p>
                </div>
              </div>
              <button className="text-sm text-primary hover:text-primary/80">
                查看
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
          <p className="text-slate-500 dark:text-slate-400 mt-2">暂无流失预警</p>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const activeCustomers = getActiveCustomers();
  const paymentStats = getPaymentStats();
  const totalValue = mockOpportunities.reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="space-y-6 relative">
      {/* Ambient glow effects */}
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>
      
      {/* 页面标题 */}
      <div className="fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-['Outfit']">工作台</h1>
        </div>
        <p className="text-slate-600 dark:text-gray-200 ml-4">欢迎回来，<span className="text-amber-600 dark:text-amber-300 font-medium">Alex</span>！今天有 <span className="text-slate-900 dark:text-white font-semibold">4</span> 个待办事项</p>
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
          gradient="from-emerald-500 to-emerald-600"
          delay={100}
        />
        <StatsCard
          title="活跃客户"
          value={activeCustomers.toString()}
          change="+3 本月新增"
          icon="group"
          gradient="from-blue-500 to-blue-600"
          delay={200}
        />
        <StatsCard
          title="漏斗价值"
          value={formatCurrency(totalValue)}
          change="7 个活跃机会"
          icon="filter_alt"
          gradient="from-amber-500 to-amber-600"
          delay={300}
        />
        <StatsCard
          title="今日拜访"
          value="4"
          change="2 个高优先级"
          icon="event"
          gradient="from-purple-500 to-purple-600"
          delay={400}
        />
      </div>

      {/* 中间区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelOverview />
        <AIRecordingList />
      </div>

      {/* AI分析区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OpportunityScoreOverview />
        <ChurnAlertWidget />
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