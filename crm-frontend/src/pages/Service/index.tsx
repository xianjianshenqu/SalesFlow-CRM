import { getCustomerColor } from '../../data/customers';

// 售后服务Mock数据
const mockServiceItems = [
  {
    id: 's1',
    customerName: '中国平安保险（集团）股份有限公司',
    customerShortName: 'PA',
    project: '年度服务合同',
    status: 'active' as const,
    progress: 65,
    startDate: '2023-07-01',
    endDate: '2024-06-30',
    techLead: '张工程师',
    milestones: [
      { name: '需求调研', status: 'completed' },
      { name: '系统部署', status: 'completed' },
      { name: '数据迁移', status: 'in_progress' },
      { name: '用户培训', status: 'pending' },
      { name: '验收交付', status: 'pending' }
    ]
  },
  {
    id: 's2',
    customerName: '百度在线网络技术（北京）有限公司',
    customerShortName: 'BD',
    project: 'AI训练平台实施',
    status: 'active' as const,
    progress: 40,
    startDate: '2023-09-01',
    endDate: '2023-12-31',
    techLead: '李工程师',
    milestones: [
      { name: '环境搭建', status: 'completed' },
      { name: '模型部署', status: 'in_progress' },
      { name: '性能测试', status: 'pending' },
      { name: '上线运维', status: 'pending' }
    ]
  },
  {
    id: 's3',
    customerName: '美团点评',
    customerShortName: 'MT',
    project: '数据分析平台',
    status: 'pending' as const,
    progress: 0,
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    techLead: '王工程师',
    milestones: [
      { name: '项目启动', status: 'pending' },
      { name: '需求确认', status: 'pending' },
      { name: '开发实施', status: 'pending' },
      { name: '测试验收', status: 'pending' }
    ]
  }
];

// 催款提醒Mock数据
const paymentReminders = [
  {
    customerName: '华为技术有限公司',
    amount: 312500,
    dueDate: '2023-10-15',
    status: 'overdue'
  },
  {
    customerName: '宁德时代新能源科技股份有限公司',
    amount: 340000,
    dueDate: '2023-10-05',
    status: 'overdue'
  }
];

// 状态标签
function StatusBadge({ status }: { status: 'active' | 'pending' | 'completed' }) {
  const config = {
    active: { label: '进行中', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    pending: { label: '待启动', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    completed: { label: '已完成', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' }
  };
  const { label, bg, text } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

// 里程碑状态图标
function MilestoneStatus({ status }: { status: 'completed' | 'in_progress' | 'pending' }) {
  if (status === 'completed') {
    return <span className="material-symbols-outlined text-emerald-500">check_circle</span>;
  }
  if (status === 'in_progress') {
    return <span className="material-symbols-outlined text-blue-500 animate-spin">progress_activity</span>;
  }
  return <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">radio_button_unchecked</span>;
}

// 实施进度卡片
function ImplementationCard({ item }: { item: typeof mockServiceItems[0] }) {
  const colorClass = getCustomerColor(item.customerShortName);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`size-12 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold`}>
            {item.customerShortName}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{item.customerName}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.project}</p>
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-slate-500 dark:text-slate-400">实施进度</span>
          <span className="font-medium text-slate-900 dark:text-white">{item.progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>

      {/* 里程碑 */}
      <div className="space-y-2 mb-4">
        {item.milestones.map((milestone, i) => (
          <div key={i} className="flex items-center gap-3">
            <MilestoneStatus status={milestone.status} />
            <span className={`text-sm ${
              milestone.status === 'completed' 
                ? 'text-slate-600 dark:text-slate-400 line-through' 
                : milestone.status === 'in_progress'
                ? 'text-primary font-medium'
                : 'text-slate-400 dark:text-slate-500'
            }`}>
              {milestone.name}
            </span>
          </div>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400">技术负责人: </span>
          <span className="text-slate-700 dark:text-slate-300">{item.techLead}</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          {item.startDate} - {item.endDate}
        </div>
      </div>
    </div>
  );
}

// 催款提醒卡片
function PaymentReminderCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">催款提醒</h3>
        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
          {paymentReminders.length} 笔逾期
        </span>
      </div>
      <div className="space-y-4">
        {paymentReminders.map((reminder, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white text-sm">{reminder.customerName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">到期日: {reminder.dueDate}</p>
            </div>
            <p className="font-semibold text-red-600">¥{(reminder.amount / 10000).toFixed(0)}万</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 技术团队同步状态
function TeamSyncCard() {
  const teamMembers = [
    { name: '张工程师', status: 'online', task: '平安项目数据迁移' },
    { name: '李工程师', status: 'online', task: '百度AI平台部署' },
    { name: '王工程师', status: 'offline', task: '美团项目准备' },
    { name: '赵工程师', status: 'busy', task: '技术支持' }
  ];

  const statusConfig = {
    online: { color: 'bg-emerald-500', label: '在线' },
    offline: { color: 'bg-slate-300', label: '离线' },
    busy: { color: 'bg-amber-500', label: '忙碌' }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">技术团队状态</h3>
      <div className="space-y-3">
        {teamMembers.map((member, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="relative">
              <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {member.name[0]}
                </span>
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 size-3 ${statusConfig[member.status as keyof typeof statusConfig].color} rounded-full border-2 border-white dark:border-slate-900`}></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{member.task}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              member.status === 'online' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
              member.status === 'busy' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
              'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {statusConfig[member.status as keyof typeof statusConfig].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Service() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">售后服务</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">追踪项目实施进度，协调技术资源</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          新建项目
        </button>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 实施项目列表 */}
        <div className="lg:col-span-2 space-y-6">
          {mockServiceItems.map((item) => (
            <ImplementationCard key={item.id} item={item} />
          ))}
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          <PaymentReminderCard />
          <TeamSyncCard />
        </div>
      </div>
    </div>
  );
}