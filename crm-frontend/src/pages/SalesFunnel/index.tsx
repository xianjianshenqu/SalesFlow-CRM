import { useState } from 'react';
import { mockOpportunities } from '../../data/opportunities';
import { STAGE_LABELS, STAGE_COLORS, type Opportunity, type Stage } from '../../types';

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 机会卡片组件
function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-slate-300'
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 ${priorityColors[opportunity.priority]} cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow`}
    >
      {/* 标题和概率 */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
          {opportunity.title}
        </h4>
        <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded shrink-0">
          {opportunity.probability}%
        </span>
      </div>

      {/* 客户名称 */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
        {opportunity.customerName}
      </p>

      {/* 金额和负责人 */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-primary text-sm">
          {formatCurrency(opportunity.value)}
        </span>
        <div className="flex items-center gap-1">
          <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
              {opportunity.owner.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>

      {/* 下一步 */}
      {opportunity.nextStep && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">下一步:</span> {opportunity.nextStep}
          </p>
        </div>
      )}
    </div>
  );
}

// 阶段列组件
function StageColumn({ 
  stage, 
  opportunities,
  totalValue 
}: { 
  stage: Stage;
  opportunities: Opportunity[];
  totalValue: number;
}) {
  const colors = STAGE_COLORS[stage];
  const stageColors: Record<Stage, string> = {
    new_lead: 'bg-slate-500',
    contacted: 'bg-indigo-500',
    solution: 'bg-blue-500',
    negotiation: 'bg-amber-500',
    won: 'bg-emerald-500'
  };

  return (
    <div className="flex-1 min-w-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-xl">
      {/* 列头 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${stageColors[stage]}`}></div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{STAGE_LABELS[stage]}</h3>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {opportunities.length}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          总价值: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalValue)}</span>
        </p>
      </div>

      {/* 卡片列表 */}
      <div className="p-4 space-y-3 min-h-[400px]">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
        
        {opportunities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
            <p className="text-sm">暂无机会</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 漏斗统计卡片
function FunnelStats() {
  const totalValue = mockOpportunities.reduce((sum, o) => sum + o.value, 0);
  const weightedValue = mockOpportunities.reduce((sum, o) => sum + (o.value * o.probability / 100), 0);
  const avgProbability = mockOpportunities.length > 0 
    ? Math.round(mockOpportunities.reduce((sum, o) => sum + o.probability, 0) / mockOpportunities.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">总机会数</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{mockOpportunities.length}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">总价值</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalValue)}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">加权价值</p>
        <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(weightedValue)}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">平均成交率</p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">{avgProbability}%</p>
      </div>
    </div>
  );
}

export default function SalesFunnel() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const stages: Stage[] = ['new_lead', 'contacted', 'solution', 'negotiation'];

  const getOpportunitiesByStage = (stage: Stage) => 
    mockOpportunities.filter(o => o.stage === stage);

  const getStageTotalValue = (stage: Stage) => 
    getOpportunitiesByStage(stage).reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">销售漏斗</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">可视化管理销售机会，追踪转化进度</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 视图切换 */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">view_kanban</span>
              看板
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">view_list</span>
              列表
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            新建机会
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <FunnelStats />

      {/* 看板视图 */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            opportunities={getOpportunitiesByStage(stage)}
            totalValue={getStageTotalValue(stage)}
          />
        ))}
      </div>
    </div>
  );
}