/**
 * 客户画像面板组件
 * 显示AI提取的客户洞察信息
 */

import { useState, useEffect } from 'react';
import type {
  CustomerInsight,
  ExtractedNeed,
  DecisionMaker,
  PainPoint,
  CompetitorInfo,
} from '../../types';

interface CustomerInsightPanelProps {
  customerId: string;
  onInsightUpdate?: (insight: CustomerInsight) => void;
}

// 获取优先级颜色
function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
}

// 获取严重程度颜色
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'border-red-300 dark:border-red-700';
    case 'medium':
      return 'border-amber-300 dark:border-amber-700';
    default:
      return 'border-slate-300 dark:border-slate-600';
  }
}

// 获取影响力颜色
function getInfluenceColor(influence: string): string {
  switch (influence) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
}

// 获取态度颜色
function getStanceColor(stance: string): string {
  switch (stance) {
    case 'supporter':
      return 'text-emerald-500';
    case 'blocker':
      return 'text-red-500';
    default:
      return 'text-slate-400';
  }
}

// 获取态度图标
function getStanceIcon(stance: string): string {
  switch (stance) {
    case 'supporter':
      return 'thumb_up';
    case 'blocker':
      return 'thumb_down';
    default:
      return 'thumbs_up_down';
  }
}

export function CustomerInsightPanel({ customerId, onInsightUpdate }: CustomerInsightPanelProps) {
  const [insight, setInsight] = useState<CustomerInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'needs' | 'decision' | 'painpoints' | 'competitors'>('needs');

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const { getCustomerInsights, generateCustomerInsights } = await import('../../services/aiService');
      try {
        const data = await getCustomerInsights(customerId);
        setInsight(data);
        onInsightUpdate?.(data);
      } catch {
        // 如果获取失败，尝试生成
        const data = await generateCustomerInsights(customerId);
        setInsight(data);
        onInsightUpdate?.(data);
      }
    } catch (err) {
      setError('获取洞察失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [customerId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">psychology</span>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{error || '暂无洞察数据'}</p>
          <button
            onClick={fetchInsight}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            生成洞察
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* 标题 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            客户画像
          </h3>
          <div className="flex items-center gap-2">
            {/* 置信度 */}
            <div className="flex items-center gap-1 text-sm">
              <span className="text-slate-500 dark:text-slate-400">置信度:</span>
              <span className={`font-medium ${
                insight.confidence >= 70 ? 'text-emerald-500' :
                insight.confidence >= 40 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {insight.confidence}%
              </span>
            </div>
            <button
              onClick={fetchInsight}
              className="text-sm text-slate-500 hover:text-primary transition-colors"
            >
              刷新
            </button>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex">
          {[
            { key: 'needs', label: '需求', icon: 'lightbulb' },
            { key: 'decision', label: '决策人', icon: 'group' },
            { key: 'painpoints', label: '痛点', icon: 'error' },
            { key: 'competitors', label: '竞品', icon: 'compare' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区 */}
      <div className="p-4">
        {activeTab === 'needs' && (
          <div className="space-y-4">
            {/* 预算信息 */}
            {insight.extractedBudget && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                <h4 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  预算信息
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {insight.extractedBudget.range && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">预算范围:</span>
                      <span className="ml-2 font-medium text-emerald-700 dark:text-emerald-400">
                        {insight.extractedBudget.range}
                      </span>
                    </div>
                  )}
                  {insight.extractedBudget.timeline && (
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">时间线:</span>
                      <span className="ml-2 text-emerald-600 dark:text-emerald-300">{insight.extractedBudget.timeline}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">置信度:</span>
                    <span className="ml-2 text-emerald-600 dark:text-emerald-300">
                      {insight.extractedBudget.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 需求列表 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">提取的需求</h4>
              {insight.extractedNeeds.length > 0 ? (
                insight.extractedNeeds.map((need: ExtractedNeed, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      <span className="text-slate-900 dark:text-white">{need.need}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{need.source}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(need.priority)}`}>
                        {need.priority === 'high' ? '高' : need.priority === 'medium' ? '中' : '低'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400">暂无需求信息</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'decision' && (
          <div className="space-y-3">
            {insight.decisionMakers.length > 0 ? (
              insight.decisionMakers.map((dm: DecisionMaker, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">person</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{dm.name}</p>
                      {dm.title && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{dm.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${getStanceColor(dm.stance)}`}>
                      {getStanceIcon(dm.stance)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getInfluenceColor(dm.influence)}`}>
                      {dm.influence === 'high' ? '高影响' : dm.influence === 'medium' ? '中影响' : '低影响'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无决策人信息
              </div>
            )}
          </div>
        )}

        {activeTab === 'painpoints' && (
          <div className="space-y-3">
            {insight.painPoints.length > 0 ? (
              insight.painPoints.map((pp: PainPoint, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${getSeverityColor(pp.severity)} bg-slate-50 dark:bg-slate-800`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 dark:text-white">{pp.point}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(pp.severity)}`}>
                      {pp.severity === 'high' ? '严重' : pp.severity === 'medium' ? '中等' : '轻微'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">类别: {pp.category}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无痛点信息
              </div>
            )}
          </div>
        )}

        {activeTab === 'competitors' && (
          <div className="space-y-3">
            {insight.competitorInfo.length > 0 ? (
              insight.competitorInfo.map((comp: CompetitorInfo, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-amber-500">store</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{comp.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {comp.strength && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 mb-1">优势</p>
                        <p className="text-red-600 dark:text-red-400">{comp.strength}</p>
                      </div>
                    )}
                    {comp.weakness && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 mb-1">劣势</p>
                        <p className="text-emerald-600 dark:text-emerald-400">{comp.weakness}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无竞品信息
              </div>
            )}
          </div>
        )}
      </div>

      {/* 时间线 */}
      {insight.timeline.milestones.length > 0 && activeTab === 'needs' && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">关键里程碑</h4>
          <div className="flex flex-wrap gap-2">
            {insight.timeline.milestones.map((milestone, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm"
              >
                <span className="text-slate-600 dark:text-slate-300">{milestone.name}</span>
                {milestone.date && (
                  <span className="ml-2 text-primary font-medium">{milestone.date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerInsightPanel;