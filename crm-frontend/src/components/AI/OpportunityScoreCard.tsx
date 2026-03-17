/**
 * 商机评分卡片组件
 * 显示商机的综合评分和各维度评分
 */

import { useState, useEffect } from 'react';
import type { OpportunityScore, ScoreFactor } from '../../types';

interface OpportunityScoreCardProps {
  opportunityId: string;
  onScoreUpdate?: (score: OpportunityScore) => void;
}

// 获取分数对应的颜色
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

// 获取分数对应的背景色
function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

// 获取影响类型的颜色
function getImpactColor(impact: string): string {
  switch (impact) {
    case 'positive':
      return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
    case 'negative':
      return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    default:
      return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
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

export function OpportunityScoreCard({ opportunityId, onScoreUpdate }: OpportunityScoreCardProps) {
  const [score, setScore] = useState<OpportunityScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'risks' | 'recommendations'>('overview');

  const fetchScore = async () => {
    setLoading(true);
    setError(null);
    try {
      const { getOpportunityScore, calculateOpportunityScore } = await import('../../services/aiService');
      try {
        const data = await getOpportunityScore(opportunityId);
        setScore(data);
        onScoreUpdate?.(data);
      } catch {
        // 如果获取失败，尝试计算
        const data = await calculateOpportunityScore(opportunityId);
        setScore(data);
        onScoreUpdate?.(data);
      }
    } catch (err) {
      setError('获取评分失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, [opportunityId]);

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

  if (error || !score) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">analytics</span>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{error || '暂无评分数据'}</p>
          <button
            onClick={fetchScore}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            计算评分
          </button>
        </div>
      </div>
    );
  }

  const scoreDimensions = [
    { name: '互动活跃度', value: score.engagementScore, key: 'engagement' },
    { name: '预算匹配度', value: score.budgetScore, key: 'budget' },
    { name: '决策人接触', value: score.authorityScore, key: 'authority' },
    { name: '需求明确度', value: score.needScore, key: 'need' },
    { name: '时机成熟度', value: score.timingScore, key: 'timing' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* 标题 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            商机评分
          </h3>
          <button
            onClick={fetchScore}
            className="text-sm text-slate-500 hover:text-primary transition-colors"
          >
            刷新
          </button>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex">
          {[
            { key: 'overview', label: '概览' },
            { key: 'factors', label: '因子' },
            { key: 'risks', label: '风险' },
            { key: 'recommendations', label: '建议' },
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
            {/* 总分和成交概率 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="size-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${score.overallScore * 2.51} 251`}
                      className={getScoreColor(score.overallScore)}
                    />
                  </svg>
                  <span className={`absolute text-2xl font-bold ${getScoreColor(score.overallScore)}`}>
                    {score.overallScore}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">综合评分</p>
              </div>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="size-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${score.winProbability * 2.51} 251`}
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-primary">
                    {score.winProbability}%
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">成交概率</p>
              </div>
            </div>

            {/* 各维度评分 */}
            <div className="space-y-3">
              {scoreDimensions.map((dim) => (
                <div key={dim.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{dim.name}</span>
                    <span className={`font-medium ${getScoreColor(dim.value)}`}>{dim.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBgColor(dim.value)} rounded-full transition-all`}
                      style={{ width: `${dim.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="space-y-3">
            {score.factors.map((factor: ScoreFactor, index: number) => (
              <div
                key={index}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 dark:text-white">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getImpactColor(factor.impact)}`}>
                      {factor.impact === 'positive' ? '正面' : factor.impact === 'negative' ? '负面' : '中性'}
                    </span>
                    <span className={`font-semibold ${getScoreColor(factor.score)}`}>
                      {factor.score}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{factor.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-3">
            {score.riskFactors.length > 0 ? (
              score.riskFactors.map((risk, index) => (
                <div
                  key={index}
                  className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-700 dark:text-red-400">{risk.factor}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      risk.severity === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : risk.severity === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {risk.severity === 'high' ? '高' : risk.severity === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300">{risk.suggestion}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无风险因素
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {score.recommendations.length > 0 ? (
              score.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900 dark:text-white">{rec.action}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}优先
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    预期效果: {rec.expectedImpact}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                暂无改进建议
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunityScoreCard;