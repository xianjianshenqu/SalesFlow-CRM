import { useState } from 'react';

// 售前资源Mock数据
const mockResources = [
  { id: '1', name: '张技术', title: '高级售前工程师', skills: ['云计算', '大数据', 'AI'], status: 'available', currentProject: null },
  { id: '2', name: '李方案', title: '方案架构师', skills: ['企业架构', '微服务', '安全'], status: 'busy', currentProject: '华为数字化转型' },
  { id: '3', name: '王演示', title: '售前顾问', skills: ['产品演示', '需求分析'], status: 'available', currentProject: null },
  { id: '4', name: '赵文档', title: '技术文档工程师', skills: ['技术文档', '方案编写'], status: 'busy', currentProject: '阿里智能客服' },
  { id: '5', name: '陈POC', title: 'POC工程师', skills: ['POC实施', '性能测试'], status: 'offline', currentProject: null }
];

// 售前请求Mock数据
const mockRequests = [
  { id: '1', customer: '华为技术有限公司', project: '数字化转型项目', type: '技术支持', priority: 'high', status: 'pending', requester: 'Alex Chen', createdAt: '2023-10-16' },
  { id: '2', customer: '阿里巴巴集团', project: '智能客服升级', type: '方案设计', priority: 'medium', status: 'in_progress', requester: 'Sarah Wang', createdAt: '2023-10-15' },
  { id: '3', customer: '宁德时代', project: 'MES系统实施', type: 'POC演示', priority: 'high', status: 'completed', requester: 'Mike Liu', createdAt: '2023-10-14' }
];

// 资源状态标签
function StatusBadge({ status }: { status: 'available' | 'busy' | 'offline' }) {
  const config = {
    available: { label: '空闲', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
    busy: { label: '忙碌', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    offline: { label: '离线', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', dot: 'bg-slate-400' }
  };
  const { label, bg, text, dot } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <div className={`size-1.5 rounded-full ${dot}`}></div>
      {label}
    </span>
  );
}

// 优先级标签
function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: '紧急', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    medium: { label: '一般', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    low: { label: '低', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }
  };
  const { label, color } = config[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// 请求状态标签
function RequestStatusBadge({ status }: { status: 'pending' | 'in_progress' | 'completed' }) {
  const config = {
    pending: { label: '待处理', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    in_progress: { label: '进行中', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    completed: { label: '已完成', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' }
  };
  const { label, bg, text } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

// 资源统计
function ResourceStats() {
  const available = mockResources.filter(r => r.status === 'available').length;
  const busy = mockResources.filter(r => r.status === 'busy').length;
  const offline = mockResources.filter(r => r.status === 'offline').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">总资源数</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{mockResources.length}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">可用资源</p>
        <p className="text-2xl font-bold text-emerald-500 mt-1">{available}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">忙碌中</p>
        <p className="text-2xl font-bold text-amber-500 mt-1">{busy}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">待处理请求</p>
        <p className="text-2xl font-bold text-primary mt-1">{mockRequests.filter(r => r.status === 'pending').length}</p>
      </div>
    </div>
  );
}

// 资源卡片
function ResourceCard({ resource }: { resource: typeof mockResources[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-medium text-slate-600 dark:text-slate-300">
            {resource.name[0]}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{resource.name}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{resource.title}</p>
          </div>
        </div>
        <StatusBadge status={resource.status} />
      </div>

      {/* 技能标签 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {resource.skills.slice(0, expanded ? undefined : 3).map((skill, i) => (
          <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
            {skill}
          </span>
        ))}
        {resource.skills.length > 3 && !expanded && (
          <button 
            onClick={() => setExpanded(true)}
            className="px-2 py-1 text-primary text-xs hover:underline"
          >
            +{resource.skills.length - 3} 更多
          </button>
        )}
      </div>

      {/* 当前项目 */}
      {resource.currentProject && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">当前项目</p>
          <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{resource.currentProject}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-4 flex items-center gap-2">
        <button className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          申请支持
        </button>
        <button className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          查看日程
        </button>
      </div>
    </div>
  );
}

// 请求列表
function RequestList() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">售前支持请求</h3>
        <button className="text-sm text-primary hover:text-primary/80">查看全部</button>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {mockRequests.map((request) => (
          <div key={request.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-900 dark:text-white">{request.customer}</h4>
                  <PriorityBadge priority={request.priority} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{request.project}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
                  <span>类型: {request.type}</span>
                  <span>申请人: {request.requester}</span>
                  <span>{request.createdAt}</span>
                </div>
              </div>
              <RequestStatusBadge status={request.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 快速入口
function QuickActions() {
  const actions = [
    { icon: 'support_agent', label: '申请技术支持', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' },
    { icon: 'description', label: '请求方案设计', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-500' },
    { icon: 'science', label: '申请POC演示', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' },
    { icon: 'school', label: '培训资源', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-500' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">快速入口</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <button key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className={`size-10 rounded-lg ${action.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined">{action.icon}</span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
          </button>
        ))}
      </div>
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
          <p className="text-slate-500 dark:text-slate-400 mt-1">协调售前资源，管理技术支持请求</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          新建请求
        </button>
      </div>

      {/* 统计 */}
      <ResourceStats />

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 资源列表 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">售前资源</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg font-medium">全部</button>
              <button className="px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">空闲</button>
              <button className="px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">忙碌</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          <QuickActions />
          <RequestList />
        </div>
      </div>
    </div>
  );
}