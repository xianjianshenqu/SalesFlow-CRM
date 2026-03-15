// 日程任务Mock数据
const mockTasks = [
  {
    id: 't1',
    title: '华为项目进度会议',
    description: '讨论数字化转型项目进度和下一步计划',
    startTime: '09:00',
    endTime: '10:00',
    type: 'meeting' as const,
    priority: 'high' as const,
    status: 'pending' as const,
    customerName: '华为技术有限公司',
    location: '会议室 A',
    aiSuggestion: '建议准备项目进度报告和风险评估文档',
    isAIOptimized: true
  },
  {
    id: 't2',
    title: '客户拜访 - 阿里巴巴',
    description: '演示智能客服系统功能',
    startTime: '11:00',
    endTime: '12:30',
    type: 'visit' as const,
    priority: 'high' as const,
    status: 'pending' as const,
    customerName: '阿里巴巴集团',
    location: '杭州阿里园区',
    aiSuggestion: '根据历史数据，上午拜访成功率更高',
    isAIOptimized: true
  },
  {
    id: 't3',
    title: '方案评审 - 宁德时代',
    description: 'MES系统实施方案评审',
    startTime: '14:00',
    endTime: '15:00',
    type: 'task' as const,
    priority: 'medium' as const,
    status: 'pending' as const,
    customerName: '宁德时代新能源科技股份有限公司',
    aiSuggestion: null,
    isAIOptimized: false
  },
  {
    id: 't4',
    title: '电话跟进 - 比亚迪',
    description: '确认供应链系统需求细节',
    startTime: '16:00',
    endTime: '16:30',
    type: 'call' as const,
    priority: 'medium' as const,
    status: 'pending' as const,
    customerName: '比亚迪股份有限公司',
    aiSuggestion: '建议在下午4-5点拨打，接通率最高',
    isAIOptimized: true
  },
  {
    id: 't5',
    title: '团队周会',
    description: '销售团队每周例会',
    startTime: '17:00',
    endTime: '18:00',
    type: 'meeting' as const,
    priority: 'low' as const,
    status: 'pending' as const,
    customerName: null,
    location: '线上会议',
    aiSuggestion: null,
    isAIOptimized: false
  }
];

// 已完成任务
const completedTasks = [
  { title: '发送报价单给华为', time: '08:30', customerName: '华为技术有限公司' },
  { title: '回复阿里邮件', time: '08:45', customerName: '阿里巴巴集团' }
];

// 任务类型图标和颜色
function TaskTypeIcon({ type }: { type: 'meeting' | 'visit' | 'call' | 'task' }) {
  const config = {
    meeting: { icon: 'groups', bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-500' },
    visit: { icon: 'location_on', bg: 'bg-emerald-50 dark:bg-emerald-900/30', color: 'text-emerald-500' },
    call: { icon: 'call', bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-500' },
    task: { icon: 'assignment', bg: 'bg-amber-50 dark:bg-amber-900/30', color: 'text-amber-500' }
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

// AI优先任务卡片
function AIPriorityCard() {
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
        <li className="flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-emerald-300">check_circle</span>
          上午拜访阿里巴巴 - 成功率预测 85%
        </li>
        <li className="flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-emerald-300">check_circle</span>
          下午4点跟进比亚迪 - 最佳联系时间
        </li>
        <li className="flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-emerald-300">check_circle</span>
          华为会议前准备进度报告
        </li>
      </ul>
    </div>
  );
}

// 任务卡片
function TaskCard({ task }: { task: typeof mockTasks[0] }) {
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
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {task.startTime} - {task.endTime}
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
function TimelineView() {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">全天时间轴</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {hours.map((hour) => {
          const task = mockTasks.find(t => parseInt(t.startTime.split(':')[0]) === hour);
          return (
            <div key={hour} className="flex min-h-[60px]">
              <div className="w-16 p-2 text-sm text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 shrink-0">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 p-2">
                {task && (
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{task.startTime} - {task.endTime}</p>
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

export default function Schedule() {
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
      <AIPriorityCard />

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">今日任务</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{mockTasks.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">AI优化</p>
          <p className="text-2xl font-bold text-primary mt-1">{mockTasks.filter(t => t.isAIOptimized).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">高优先级</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{mockTasks.filter(t => t.priority === 'high').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">已完成</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{completedTasks.length}</p>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日任务列表 */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">今日任务</h3>
          {mockTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {/* 时间轴 */}
        <div>
          <TimelineView />
        </div>
      </div>
    </div>
  );
}