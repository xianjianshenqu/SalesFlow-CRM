import { useState, useEffect } from 'react';
import { scheduleApi } from '../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';

// AI报告类型
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

// 任务类型图标和颜色
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TaskTypeIcon({ type }: { type: any }) {
  const config: Record<string, { icon: string; bg: string; color: string }> = {
    call: { icon: 'call', bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-500' },
    meeting: { icon: 'groups', bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-500' },
    email: { icon: 'mail', bg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-500' },
    visit: { icon: 'location_on', bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-500' },
    follow_up: { icon: 'person_search', bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-500' },
    other: { icon: 'assignment', bg: 'bg-slate-50 dark:bg-slate-900/30', color: 'text-slate-500' }
  };
  const { icon, bg, color } = config[type] || config.other;
  return (
    <div className={`size-10 rounded-lg ${bg} flex items-center justify-center`}>
      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    </div>
  );
}

// 优先级标签
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PriorityBadge({ priority }: { priority: any }) {
  const config: Record<string, { label: string; color: string }> = {
    high: { label: '高优先级', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    medium: { label: '中优先级', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    low: { label: '低优先级', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }
  };
  const { label, color } = config[priority] || config.low;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// AI智能建议卡片
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AIPriorityCard({ suggestions }: { suggestions: any }) {
  if (!suggestions || !suggestions.suggestions || suggestions.suggestions.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-2xl">info</span>
          <h3 className="font-semibold text-lg">暂无AI建议</h3>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">
          AI正在分析您的日程和客户数据，稍后将提供个性化建议。
        </p>
      </div>
    );
  }

  // 显示前3个高优先级建议
  const prioritySuggestions = suggestions.suggestions.slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
        <h3 className="font-semibold text-lg">AI 智能建议</h3>
      </div>
      <p className="text-white/90 text-sm leading-relaxed">
        根据您的日程和客户数据分析，建议今天优先完成以下任务：
      </p>
      <ul className="mt-4 space-y-2">
        {prioritySuggestions.map((suggestion: any, index: number) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-emerald-300">check_circle</span>
            {suggestion.title}
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/80 text-xs">
          建议健康分数: <span className="font-bold">{suggestions.summary?.overallHealthScore || 0}%</span> | 
          待办建议: <span className="font-bold">{suggestions.summary?.totalSuggestions || 0}</span>
        </p>
      </div>
    </div>
  );
}

// 任务卡片
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TaskCard({ task }: { task: any }) {
  // 将ISO日期字符串转换为本地时间并提取时间部分
  const dueDate = new Date(task.dueDate);
  const timeString = dueDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <TaskTypeIcon type={task.type} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-slate-900 dark:text-white">{task.title}</h4>
            <PriorityBadge priority={task.priority} />
          </div>
          {task.customerName && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{task.customerName}</p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">{task.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {timeString}
            </span>
            {task.location && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {task.location}
              </span>
            )}
          </div>
          {task.aiSuggestion && (
            <div className="mt-3 p-2 bg-primary/5 dark:bg-primary/10 rounded-lg">
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                {task.aiSuggestion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 时间轴视图
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TimelineView({ tasks }: { tasks: any[] }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">全天时间轴</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {hours.map((hour) => {
          const hourStr = hour.toString().padStart(2, '0');
          const task = tasks.find(t => {
            const taskHour = new Date(t.dueDate).getUTCHours();
            return taskHour === hour;
          });
          return (
            <div key={hour} className="flex min-h-[60px]">
              <div className="w-16 p-2 text-sm text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 shrink-0">
                {hourStr}:00
              </div>
              <div className="flex-1 p-2">
                {task && (
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(task.dueDate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 加载状态组件
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// 错误状态组件
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined">error</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

// 格式化日期
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Schedule() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const [tasks, setTasks] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 报告相关状态
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [showReportPanel, setShowReportPanel] = useState(false);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 并行获取所有数据
        const [tasksRes, statsRes, aiSuggestionsRes] = await Promise.all([
          scheduleApi.getToday(),
          scheduleApi.getStats(),
          scheduleApi.getAISuggestions()
        ]);
        
        setTasks(tasksRes.data);
        setStats(statsRes.data);
        setAiSuggestions(aiSuggestionsRes.data);
        
        setError(null);
      } catch (err) {
        console.error('获取日程数据失败:', err);
        setError(err instanceof Error ? err.message : '获取数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 获取报告
  const fetchReports = async () => {
    try {
      setReportLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/ai/reports?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setReports(result.data.items);
        if (result.data.items.length > 0 && !selectedReport) {
          setSelectedReport(result.data.items[0]);
        }
      }
    } catch (err) {
      console.error('获取报告失败:', err);
    } finally {
      setReportLoading(false);
    }
  };

  // 生成报告
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

  // 当显示报告面板时获取报告数据
  useEffect(() => {
    if (showReportPanel && reports.length === 0) {
      fetchReports();
    }
  }, [showReportPanel]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">智能日程</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">AI优化的日程安排，提升工作效率</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              日历视图
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              新建日程
            </button>
          </div>
        </div>
        
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">智能日程</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">AI优化的日程安排，提升工作效率</p>
          </div>
        </div>
        
        <ErrorMessage message={`加载失败: ${error}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">智能日程</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">AI优化的日程安排，提升工作效率</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowReportPanel(!showReportPanel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              showReportPanel 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm">description</span>
            AI工作报告
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            日历视图
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            新建日程
          </button>
        </div>
      </div>

      {/* AI工作报告面板 */}
      {showReportPanel && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* 左侧：报告列表和生成 */}
            <div className="lg:col-span-1 border-r border-slate-200 dark:border-slate-800">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">生成新报告</h3>
              </div>
              <div className="p-4 space-y-4">
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

              {/* 历史报告列表 */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">历史报告</h4>
                {reportLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">
                    暂无报告，点击上方按钮生成
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
                <div className="p-6">
                  {/* 报告头部 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {selectedReport.type === 'daily' ? '日报' : '周报'}
                      </h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(selectedReport.date)}
                      </span>
                    </div>
                    <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedReport.summary}
                    </p>
                  </div>

                  {/* 报告内容 */}
                  <div className="space-y-6">
                    {/* 详细内容 */}
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white mb-3">工作详情</h4>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {selectedReport.content}
                        </p>
                      </div>
                    </div>

                    {/* 重点事项 */}
                    {selectedReport.highlights && selectedReport.highlights.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-3">重点事项</h4>
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
                        <h4 className="font-medium text-slate-900 dark:text-white mb-3">风险提示</h4>
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
                        <h4 className="font-medium text-slate-900 dark:text-white mb-3">下一步行动</h4>
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
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">description</span>
                  <p className="text-slate-500 dark:text-slate-400 mt-4">
                    选择一份报告查看详情，或生成新报告
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI优先任务卡片 */}
      <AIPriorityCard suggestions={aiSuggestions} />

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">今日任务</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats?.today || 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">AI优化</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {aiSuggestions?.summary?.urgentCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">高优先级</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {stats?.priorityDistribution?.high || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">逾期任务</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">
            {stats?.overdue || 0}
          </p>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日任务列表 */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">今日任务</h3>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">checklist_rtl</span>
              <p className="text-slate-500 dark:text-slate-400">今日暂无任务</p>
            </div>
          )}
        </div>

        {/* 时间轴 */}
        <div>
          <TimelineView tasks={tasks} />
        </div>
      </div>
    </div>
  );
}