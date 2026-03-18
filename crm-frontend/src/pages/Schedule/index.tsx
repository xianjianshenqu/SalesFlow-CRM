import { useState, useEffect } from 'react';
import { scheduleApi } from '../../services/api';

// 定义类型
interface ScheduleTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  type: 'call' | 'meeting' | 'email' | 'visit' | 'follow_up' | 'other';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  customerId?: string;
  customerName?: string;
  location?: string;
  reminder?: boolean;
  assigneeId?: string;
  createdAt: string;
  aiSuggestion?: string | null;
  isAIOptimized?: boolean;
}

interface AISuggestion {
  type: 'urgent' | 'follow_up' | 'reminder' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionRequired: string;
  suggestedActions?: Array<{
    action: string;
    customerId?: string;
    customerName?: string;
    contactName?: string;
    contactRole?: string;
    reason?: string;
    urgencyLevel?: string;
    dueDate?: Date;
    time?: string;
  }>;
  impactScore?: number;
  category?: 'overdue' | 'high_value' | 'neglected' | 'optimization' | 'daily' | 'proposal' | 'location' | 'contact';
}

interface ScheduleStats {
  total: number;
  today: number;
  overdue: number;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

interface AISuggestionsResponse {
  suggestions: AISuggestion[];
  summary: {
    totalSuggestions: number;
    urgentCount: number;
    highPriorityCustomers: number;
    overdueTasks: number;
    todayTasks: number;
    neglectedCustomers: number;
    overallHealthScore: number;
    recommendedActionsToday: string[];
  };
  generatedAt: string;
  nextUpdateAt: string;
}

// 任务类型图标和颜色
function TaskTypeIcon({ type }: { type: 'call' | 'meeting' | 'email' | 'visit' | 'follow_up' | 'other' }) {
  const config = {
    call: { icon: 'call', bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-500' },
    meeting: { icon: 'groups', bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-500' },
    email: { icon: 'mail', bg: 'bg-indigo-50 dark:bg-indigo-900/30', color: 'text-indigo-500' },
    visit: { icon: 'location_on', bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-500' },
    follow_up: { icon: 'person_search', bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-500' },
    other: { icon: 'assignment', bg: 'bg-slate-50 dark:bg-slate-900/30', color: 'text-slate-500' }
  };
  const { icon, bg, color } = config[type];
  return (
    <div className={`size-10 rounded-lg ${bg} flex items-center justify-center`}>
      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    </div>
  );
}

// 优先级标签
function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: '高优先级', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    medium: { label: '中优先级', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    low: { label: '低优先级', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }
  };
  const { label, color } = config[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// AI智能建议卡片
function AIPriorityCard({ suggestions }: { suggestions: AISuggestionsResponse | null }) {
  if (!suggestions || suggestions.suggestions.length === 0) {
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
        {prioritySuggestions.map((suggestion, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-emerald-300">check_circle</span>
            {suggestion.title}
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-white/80 text-xs">
          建议健康分数: <span className="font-bold">{suggestions.summary.overallHealthScore}%</span> | 
          待办建议: <span className="font-bold">{suggestions.summary.totalSuggestions}</span>
        </p>
      </div>
    </div>
  );
}

// 任务卡片
function TaskCard({ task }: { task: ScheduleTask }) {
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
function TimelineView({ tasks }: { tasks: ScheduleTask[] }) {
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

export default function Schedule() {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            {aiSuggestions?.summary.urgentCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">高优先级</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {stats?.priorityDistribution.high || 0}
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