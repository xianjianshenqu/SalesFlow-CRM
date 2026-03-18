/**
 * AI助手页面
 * 包含智能日报/周报生成功能
 */

import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';

interface Report {
  id: string;
  date: string;
  type: 'daily' | 'weekly';
  summary: string;
  content: string;
  highlights?: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }>;
  risks?: Array<{
    level: 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
  }>;
  nextActions?: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    customer?: string;
  }>;
  createdAt: string;
}

const highlightColors = {
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const riskColors = {
  high: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

const priorityColors = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-slate-500',
};

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState<'reports' | 'suggestions'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/ai/reports?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setReports(result.data.items);
        if (result.data.items.length > 0) {
          setSelectedReport(result.data.items[0]);
        }
      }
    } catch (err) {
      console.error('获取报告失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/ai/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: reportType,
          date: new Date().toISOString().split('T')[0],
        }),
      });
      const result = await response.json();
      if (result.success) {
        // 将新报告添加到列表顶部
        setReports(prev => [result.data, ...prev]);
        setSelectedReport(result.data);
      }
    } catch (err) {
      console.error('生成报告失败:', err);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI 助手</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            智能工作助手，提升销售效率
          </p>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          智能报告
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'suggestions'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          AI建议
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：报告列表和生成 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 生成报告卡片 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">生成新报告</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">报告类型</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportType('daily')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reportType === 'daily'
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      日报
                    </button>
                    <button
                      onClick={() => setReportType('weekly')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        reportType === 'weekly'
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      周报
                    </button>
                  </div>
                </div>

                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      生成中...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">auto_awesome</span>
                      生成{reportType === 'daily' ? '日报' : '周报'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 历史报告列表 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">历史报告</h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">
                  暂无报告，点击上方按钮生成
                </p>
              ) : (
                <div className="space-y-2">
                  {reports.map(report => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedReport?.id === report.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {report.type === 'daily' ? '日报' : '周报'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(report.date)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：报告详情 */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* 报告头部 */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {selectedReport.type === 'daily' ? '日报' : '周报'}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(selectedReport.date)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedReport.summary}
                  </p>
                </div>

                {/* 报告内容 */}
                <div className="p-6 space-y-6">
                  {/* 详细内容 */}
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3">工作详情</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {selectedReport.content}
                      </p>
                    </div>
                  </div>

                  {/* 重点事项 */}
                  {selectedReport.highlights && selectedReport.highlights.length > 0 && (
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-3">重点事项</h3>
                      <div className="space-y-2">
                        {selectedReport.highlights.map((highlight, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${highlightColors[highlight.type]}`}
                          >
                            <p className="font-medium text-sm">{highlight.title}</p>
                            <p className="text-sm opacity-80 mt-1">{highlight.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 风险提示 */}
                  {selectedReport.risks && selectedReport.risks.length > 0 && (
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-3">风险提示</h3>
                      <div className="space-y-2">
                        {selectedReport.risks.map((risk, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${riskColors[risk.level]}`}
                          >
                            <p className="text-sm">{risk.description}</p>
                            <p className="text-sm opacity-80 mt-1">💡 {risk.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 下一步行动 */}
                  {selectedReport.nextActions && selectedReport.nextActions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white mb-3">下一步行动</h3>
                      <div className="space-y-2">
                        {selectedReport.nextActions.map((action, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            <span className={`material-symbols-outlined text-lg ${priorityColors[action.priority]}`}>
                              {action.priority === 'high' ? 'priority_high' : action.priority === 'medium' ? 'remove' : 'arrow_downward'}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{action.action}</p>
                              {action.customer && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  客户：{action.customer}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">description</span>
                <p className="text-slate-500 dark:text-slate-400 mt-4">
                  选择一份报告查看详情，或生成新报告
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">lightbulb</span>
          <p className="text-slate-500 dark:text-slate-400 mt-4">
            AI建议功能正在开发中...
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
            敬请期待更多智能功能
          </p>
        </div>
      )}
    </div>
  );
}