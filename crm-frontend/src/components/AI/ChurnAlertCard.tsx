/**
 * 流失预警卡片组件
 * 显示客户流失风险评分和预警信息
 */

import { useState, useEffect } from 'react';
import type { ChurnAlert, ChurnReason, RetentionSuggestion } from '../../types';

interface ChurnAlertCardProps {
  customerId: string;
  onAlertUpdate?: (alert: ChurnAlert) => void;
}

// 获取风险等级颜色
function getRiskLevelColor(level: string): { bg: string; text: string; border: string } {
  switch (level) {
    case 'high':
      return {
        bg: 'bg-red-500',
        text: 'text-red-500',
        border: 'border-red-200 dark:border-red-900/30',
      };
    case 'medium':
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-500',
        border: 'border-amber-200 dark:border-amber-900/30',
      };
    default:
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-500',
        border: 'border-emerald-200 dark:border-emerald-900/30',
      };
  }
}

// 获取风险等级标签
function getRiskLevelLabel(level: string): string {
  switch (level) {
    case 'high':
      return '高风险';
    case 'medium':
      return '中风险';
    default:
      return '低风险';
  }
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

export function ChurnAlertCard({ customerId, onAlertUpdate }: ChurnAlertCardProps) {
  const [alert, setAlert] = useState<ChurnAlert | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reasons' | 'suggestions'>('overview');

  const fetchAlert = async () => {
    setLoading(true);
    setError(null);
    try {
      const { getChurnAlert, analyzeChurnRisk } = await import('../../services/aiService');
      try {
        const data = await getChurnAlert(customerId);
        setAlert(data);
        onAlertUpdate?.(data);
      } catch {
        // 如果获取失败，尝试分析
        const data = await analyzeChurnRisk(customerId);
        setAlert(data);
        onAlertUpdate?.(data);
      }
    } catch (err) {
      setError('获取预警失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAlert = async (action: 'handled' | 'ignored') => {
    if (!alert) return;
    try {
      const { handleChurnAlert } = await import('../../services/aiService');
      const updated = await handleChurnAlert(alert.id, action);
      setAlert(updated);
      onAlertUpdate?.(updated);
    } catch (err) {
      console.error('处理预警失败:', err);
    }
  };

  useEffect(() => {
    fetchAlert();
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

  if (error || !alert) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">warning</span>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{error || '暂无预警数据'}</p>
          <button
            onClick={fetchAlert}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            分析风险
          </button>
        </div>
      </div>
    );
  }

  const colors = getRiskLevelColor(alert.riskLevel);

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border ${colors.border}`}>
      {/* 标题 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">warning</span>
            流失预警
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} text-white`}>
              {getRiskLevelLabel(alert.riskLevel)}
            </span>
            {alert.status !== 'active' && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                alert.status === 'handled'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {alert.status === 'handled' ? '已处理' : '已忽略'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex">
          {[
            { key: 'overview', label: '概览' },
            { key: 'reasons', label: '原因' },
            { key: 'suggestions', label: '建议' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区 */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 风险评分仪表盘 */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="size-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${alert.riskScore * 3.52} 352`}
                    className={colors.text}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className={`text-3xl font-bold ${colors.text}`}>{alert.riskScore}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">风险分</p>
                </div>
              </div>
            </div>

            {/* 风险信号 */}
            {alert.signals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">预警信号</h4>
                <div className="space-y-2">
                  {alert.signals.slice(0, 3).map((signal, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded"
                    >
                      <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">
                        notification_important
                      </span>
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{signal.description}</p>
                        <p className="text-xs text-slate-400">{new Date(signal.detectedAt).toLocaleDateString('zh-CN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            {alert.status === 'active' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAlert('handled')}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"
                >
                  标记已处理
                </button>
                <button
                  onClick={() => handleAlert('ignored')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  忽略
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reasons' && (
          <div className="space-y-3">
            {alert.reasons.length > 0 ? (
              alert.reasons.map((reason: ChurnReason, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900 dark:text-white">{reason.factor}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      权重: {(reason.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{reason.evidence}</p>
                  {/* 权重进度条 */}
                  <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} rounded-full`}
                      style={{ width: `${reason.weight * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无风险原因
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {alert.suggestions.length > 0 ? (
              alert.suggestions.map((suggestion: RetentionSuggestion, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">{suggestion.action}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低'}优先
                    </span>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-300">
                    预期效果: {suggestion.expectedOutcome}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无挽回建议
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChurnAlertCard;