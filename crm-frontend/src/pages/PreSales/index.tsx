import { useState } from 'react';
import { Link } from 'react-router-dom';

// 活动类型配置
const activityTypeConfig: Record<string, { label: string; color: string }> = {
  demo: { label: '产品演示', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  poc: { label: 'POC测试', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  training: { label: '培训活动', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  seminar: { label: '研讨会', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
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
function ResourceStatusDot({ status }: { status: 'available' | 'busy' | 'offline' }) {
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

// 业务统计卡片
function BusinessStats() {
  const stats = [
    { label: '本月活动', value: '12', trend: '+3', icon: 'event', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' },
    { label: '总签到人数', value: '156', trend: '+28', icon: 'how_to_reg', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' },
    { label: '待处理问题', value: '8', trend: '', icon: 'help', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' },
    { label: '审批中活动', value: '3', trend: '', icon: 'pending_action', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-xl">{stat.icon}</span>
            </div>
            {stat.trend && (
              <span className="text-xs text-emerald-500 font-medium">{stat.trend}</span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{stat.value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// 今日活动卡片
function TodayActivities() {
  const todayActivity = mockActivities.find(a => a.status === 'ongoing') || mockActivities[0];
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">today</span>
          <h3 className="font-semibold text-slate-900 dark:text-white">今日活动</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-600">
          进行中
        </span>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{todayActivity.title}</h4>
            <p className="text-sm text-slate-500 mt-1">
              {todayActivity.customer && (
                <span className="inline-flex items-center gap-1 mr-3">
                  <span className="material-symbols-outlined text-sm">business</span>
                  {todayActivity.customer}
                </span>
              )}
              <span className="inline-flex items-center gap-1 mr-3">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {todayActivity.location}
              </span>
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${activityTypeConfig[todayActivity.type]?.color || 'bg-slate-100 text-slate-600'}`}>
            {activityTypeConfig[todayActivity.type]?.label || '活动'}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">schedule</span>
            {todayActivity.time}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">how_to_reg</span>
            {todayActivity.signIns} 人签到
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">help</span>
            {todayActivity.questions} 个问题
          </span>
        </div>
      </div>
      
      <div className="px-4 pb-4 flex gap-2">
        <Link
          to={`/presales/activities/${todayActivity.id}`}
          className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium text-center hover:bg-primary/90 transition-colors"
        >
          查看详情
        </Link>
        <Link
          to={`/presales/activities/${todayActivity.id}/qrcodes`}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          二维码
        </Link>
      </div>
    </div>
  );
}

// 即将开始的活动
function UpcomingActivities() {
  const upcoming = mockActivities.filter(a => a.status !== 'ongoing' && a.status !== 'completed').slice(0, 3);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">即将开始</h3>
        <Link to="/presales/activities" className="text-sm text-primary hover:text-primary/80 font-medium">
          查看全部
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {upcoming.map((activity) => (
          <Link
            key={activity.id}
            to={`/presales/activities/${activity.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${activityTypeConfig[activity.type]?.color || 'bg-slate-100 text-slate-600'}`}>
                  {activityTypeConfig[activity.type]?.label || '活动'}
                </span>
                <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{activity.title}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>{activity.time}</span>
                {activity.customer && <span>{activity.customer}</span>}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${activityStatusConfig[activity.status]?.color || 'bg-slate-100 text-slate-500'}`}>
              {activityStatusConfig[activity.status]?.label || activity.status}
            </span>
          </Link>
        ))}
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50">
        <Link
          to="/presales/activities/create"
          className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium hover:border-primary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          新建活动
        </Link>
      </div>
    </div>
  );
}

// 最近签到
function RecentSignIns() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">最近签到</h3>
        <Link to="/presales/activities" className="text-sm text-primary hover:text-primary/80 font-medium">
          查看全部
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {mockRecentSignIns.map((signIn) => (
          <div key={signIn.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              {signIn.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{signIn.name}</p>
              <p className="text-xs text-slate-500 truncate">{signIn.company}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{signIn.time}</p>
              <p className="text-xs text-slate-400 truncate max-w-[100px]">{signIn.activity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 待处理问题
function PendingQuestions() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">待处理问题</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-600">
          {mockQuestions.length} 待处理
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {mockQuestions.map((q) => (
          <div key={q.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">help</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{q.question}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{q.customer}</span>
                  <span>•</span>
                  <span>{q.time}</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{q.category}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 售前资源概览（紧凑版）
function ResourceOverview() {
  const available = mockResources.filter(r => r.status === 'available').length;
  const busy = mockResources.filter(r => r.status === 'busy').length;
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">售前资源</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {available} 空闲
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {busy} 忙碌
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {mockResources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
              {resource.name[0]}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">{resource.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                resource.status === 'available' ? 'bg-emerald-500' :
                resource.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
              }`}></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 快速操作
function QuickActions() {
  const actions = [
    { icon: 'event_add', label: '创建活动', to: '/presales/activities/create', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' },
    { icon: 'qr_code_scanner', label: '签到入口', to: '/presales/sign-in', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' },
    { icon: 'support_agent', label: '技术支持', to: '#', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-500' },
    { icon: 'description', label: '方案设计', to: '#', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <Link
          key={i}
          to={action.to}
          className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
            <span className="material-symbols-outlined">{action.icon}</span>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function PreSales() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">售前中心</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理售前活动、客户签到与问题跟进</p>
        </div>
        <Link
          to="/presales/activities/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
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