import { Link } from 'react-router-dom';

// 活动类型配置 - 更精致的渐变标签
const activityTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  demo: { label: '产品演示', color: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/25', icon: 'play_circle' },
  poc: { label: 'POC测试', color: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/25', icon: 'science' },
  training: { label: '培训活动', color: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25', icon: 'school' },
  seminar: { label: '研讨会', color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25', icon: 'groups' },
};

// 活动状态配置
const activityStatusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600' },
  pending_approval: { label: '待审批', color: 'bg-amber-100 text-amber-600' },
  approved: { label: '已批准', color: 'bg-blue-100 text-blue-600' },
  ongoing: { label: '进行中', color: 'bg-emerald-100 text-emerald-600' },
  completed: { label: '已完成', color: 'bg-slate-100 text-slate-500' },
};

// Mock活动数据
const mockActivities = [
  { id: '1', title: '华为数字化转型产品演示', type: 'demo', status: 'ongoing', customer: '华为', location: '深圳华为基地', time: '今天 14:00-16:00', signIns: 25, questions: 8 },
  { id: '2', title: '阿里云智能客服POC测试', type: 'poc', status: 'pending_approval', customer: '阿里巴巴', location: '杭州西溪园区', time: '明天 09:00-17:00', signIns: 0, questions: 0 },
  { id: '3', title: '销售团队产品培训', type: 'training', status: 'draft', customer: '', location: '公司总部', time: '03-25 09:00-12:00', signIns: 0, questions: 0 },
  { id: '4', title: '金融行业解决方案研讨会', type: 'seminar', status: 'approved', customer: '招商银行', location: '深圳福田', time: '03-28 14:00-17:00', signIns: 0, questions: 0 },
];

// Mock签到数据
const mockRecentSignIns = [
  { id: '1', name: '张经理', company: '华为技术', activity: '华为产品演示', time: '14:32' },
  { id: '2', name: '李总监', company: '华为技术', activity: '华为产品演示', time: '14:28' },
  { id: '3', name: '王工程师', company: '华为技术', activity: '华为产品演示', time: '14:25' },
];

// Mock问题数据
const mockQuestions = [
  { id: '1', question: '产品是否支持私有化部署？', customer: '张经理', activity: '华为产品演示', category: '产品功能', time: '14:35' },
  { id: '2', question: '实施周期大概需要多久？', customer: '李总监', activity: '华为产品演示', category: '实施交付', time: '14:30' },
];

// 售前资源Mock数据（简化版）
const mockResources = [
  { id: '1', name: '张技术', title: '高级售前工程师', status: 'available' },
  { id: '2', name: '李方案', title: '方案架构师', status: 'busy' },
  { id: '3', name: '王演示', title: '售前顾问', status: 'available' },
  { id: '4', name: '赵文档', title: '技术文档工程师', status: 'busy' },
  { id: '5', name: '陈POC', title: 'POC工程师', status: 'offline' },
];

// 资源状态指示器
export function _ResourceStatusDot({ status }: { status: 'available' | 'busy' | 'offline' }) {
  const colors = {
    available: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-400',
  };
  const labels = {
    available: '空闲',
    busy: '忙碌',
    offline: '离线',
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${colors[status]}`}></span>
      <span className="text-xs text-slate-500">{labels[status]}</span>
    </span>
  );
}

// 业务统计卡片 - 现代化设计
function BusinessStats() {
  const stats = [
    { 
      label: '本月活动', 
      value: '12', 
      trend: '+3', 
      icon: 'event', 
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
      shadowColor: 'shadow-blue-500/20'
    },
    { 
      label: '总签到人数', 
      value: '156', 
      trend: '+28', 
      icon: 'how_to_reg', 
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50',
      shadowColor: 'shadow-emerald-500/20'
    },
    { 
      label: '待处理问题', 
      value: '8', 
      trend: '', 
      icon: 'help', 
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50',
      shadowColor: 'shadow-amber-500/20'
    },
    { 
      label: '审批中活动', 
      value: '3', 
      trend: '', 
      icon: 'pending_action', 
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50',
      shadowColor: 'shadow-violet-500/20'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="group relative bg-gradient-to-br dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
        >
          {/* 背景装饰 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
          
          <div className="relative flex items-center justify-between">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center ${stat.shadowColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="material-symbols-outlined text-white text-xl drop-shadow-sm">{stat.icon}</span>
            </div>
            {stat.trend && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-1 rounded-full">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                {stat.trend}
              </span>
            )}
          </div>
          <p className="relative text-3xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight">{stat.value}</p>
          <p className="relative text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// 今日活动卡片 - 高级视觉设计
function TodayActivities() {
  const todayActivity = mockActivities.find(a => a.status === 'ongoing') || mockActivities[0];
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      {/* 头部带渐变 */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">today</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">今日活动</h3>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          进行中
        </span>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-lg">{todayActivity.title}</h4>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              {todayActivity.customer && (
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-500 text-xs">business</span>
                  </span>
                  {todayActivity.customer}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500 text-xs">location_on</span>
                </span>
                {todayActivity.location}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg ${activityTypeConfig[todayActivity.type]?.color || 'bg-slate-100 text-slate-600'}`}>
            {activityTypeConfig[todayActivity.type]?.label || '活动'}
          </span>
        </div>
        
        <div className="flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
            <span className="font-medium">{todayActivity.time}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-base text-emerald-500">how_to_reg</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">{todayActivity.signIns} 人签到</span>
          </span>
          <span className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-base text-amber-500">help</span>
            <span className="font-medium text-amber-700 dark:text-amber-400">{todayActivity.questions} 个问题</span>
          </span>
        </div>
      </div>
      
      <div className="px-5 pb-5 flex gap-3">
        <Link
          to={`/presales/activities/${todayActivity.id}`}
          className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl text-sm font-semibold text-center hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          查看详情
        </Link>
        <Link
          to={`/presales/activities/${todayActivity.id}/qrcodes`}
          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          二维码
        </Link>
      </div>
    </div>
  );
}

// 即将开始的活动 - 精美列表设计
function UpcomingActivities() {
  const upcoming = mockActivities.filter(a => a.status !== 'ongoing' && a.status !== 'completed').slice(0, 3);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">upcoming</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">即将开始</h3>
        </div>
        <Link to="/presales/activities" className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1 group">
          查看全部
          <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {upcoming.map((activity) => (
          <Link
            key={activity.id}
            to={`/presales/activities/${activity.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold shadow-lg ${activityTypeConfig[activity.type]?.color || 'bg-slate-100 text-slate-600'}`}>
                  {activityTypeConfig[activity.type]?.label || '活动'}
                </span>
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate group-hover:text-primary transition-colors">{activity.title}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {activity.time}
                </span>
                {activity.customer && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">business</span>
                    {activity.customer}
                  </span>
                )}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${activityStatusConfig[activity.status]?.color || 'bg-slate-100 text-slate-500'}`}>
              {activityStatusConfig[activity.status]?.label || activity.status}
            </span>
          </Link>
        ))}
      </div>
      <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50">
        <Link
          to="/presales/activities/create"
          className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
        >
          <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform duration-300">add</span>
          新建活动
        </Link>
      </div>
    </div>
  );
}

// 最近签到 - 美化头像和动画
function RecentSignIns() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">how_to_reg</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">最近签到</h3>
        </div>
        <Link to="/presales/activities" className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1 group">
          查看全部
          <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {mockRecentSignIns.map((signIn, index) => (
          <div key={signIn.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              {signIn.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{signIn.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-400">apartment</span>
                {signIn.company}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{signIn.time}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[100px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-0.5">{signIn.activity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 待处理问题 - 突出显示问题卡片
function PendingQuestions() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">help</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">待处理问题</h3>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
          {mockQuestions.length} 待处理
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {mockQuestions.map((q) => (
          <div key={q.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">contact_support</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{q.question}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">person</span>
                    {q.customer}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span>{q.time}</span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-medium">{q.category}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 售前资源概览 - 精美卡片设计
function ResourceOverview() {
  const available = mockResources.filter(r => r.status === 'available').length;
  const busy = mockResources.filter(r => r.status === 'busy').length;
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">groups</span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">售前资源</h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {available} 空闲
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {busy} 忙碌
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {mockResources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
              resource.status === 'available' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/20' :
              resource.status === 'busy' ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20' : 
              'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-500/20'
            } group-hover:scale-110 transition-transform`}>
              {resource.name[0]}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{resource.name}</span>
            <span className={`w-2 h-2 rounded-full ${
              resource.status === 'available' ? 'bg-emerald-500' :
              resource.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
            }`}></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 快速操作 - 玻璃态设计
function QuickActions() {
  const actions = [
    { icon: 'event_add', label: '创建活动', to: '/presales/activities/create', gradient: 'from-blue-500 to-cyan-500', iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { icon: 'qr_code_scanner', label: '签到入口', to: '/presales/sign-in', gradient: 'from-emerald-500 to-teal-500', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
    { icon: 'support_agent', label: '技术支持', to: '#', gradient: 'from-violet-500 to-purple-500', iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500' },
    { icon: 'description', label: '方案设计', to: '#', gradient: 'from-amber-500 to-orange-500', iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <Link
          key={i}
          to={action.to}
          className="group relative flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-primary/30 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
        >
          {/* 悬浮渐变背景 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <div className={`relative w-11 h-11 ${action.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <span className="material-symbols-outlined text-white text-lg drop-shadow-sm">{action.icon}</span>
          </div>
          <span className="relative text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{action.label}</span>
          
          {/* 箭头指示器 */}
          <span className="material-symbols-outlined absolute right-3 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-sm">
            arrow_forward
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function PreSales() {
  return (
    <div className="space-y-6">
      {/* 页面标题 - 现代化设计 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl">storefront</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">售前中心</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">管理售前活动、客户签到与问题跟进</p>
            </div>
          </div>
        </div>
        <Link
          to="/presales/activities/create"
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="material-symbols-outlined text-base group-hover:rotate-90 transition-transform duration-300">add</span>
          新建活动
        </Link>
      </div>

      {/* 业务统计 */}
      <BusinessStats />

      {/* 快速操作 */}
      <QuickActions />

      {/* 主内容区 - 重点突出活动和签到 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主区域 - 活动相关 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 今日活动 */}
          <TodayActivities />
          
          {/* 即将开始的活动 */}
          <UpcomingActivities />
        </div>

        {/* 右侧区域 - 签到、问题、资源 */}
        <div className="space-y-6">
          {/* 最近签到 */}
          <RecentSignIns />
          
          {/* 待处理问题 */}
          <PendingQuestions />
        </div>
      </div>

      {/* 底部 - 资源概览（紧凑展示） */}
      <ResourceOverview />
    </div>
  );
}