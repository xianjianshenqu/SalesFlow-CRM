import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 活动类型
interface PresalesActivity {
  id: string;
  title: string;
  type: 'demo' | 'poc' | 'training' | 'seminar' | 'other';
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'ongoing' | 'completed' | 'cancelled';
  approvalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  customer?: {
    id: string;
    name: string;
    company: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  _count?: {
    signIns: number;
    questions: number;
  };
  createdAt: string;
}

// 活动类型配置
const activityTypeConfig = {
  demo: { label: '产品演示', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  poc: { label: 'POC测试', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  training: { label: '培训活动', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  seminar: { label: '研讨会', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  other: { label: '其他', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
};

// 活动状态配置
const activityStatusConfig = {
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  pending_approval: { label: '待审批', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  approved: { label: '已批准', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  ongoing: { label: '进行中', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  completed: { label: '已完成', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
};

// 活动卡片组件
function ActivityCard({ activity }: { activity: PresalesActivity }) {
  const typeConfig = activityTypeConfig[activity.type] || activityTypeConfig.other;
  const statusConfig = activityStatusConfig[activity.status] || activityStatusConfig.draft;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link
      to={`/presales/activities/${activity.id}`}
      className="block bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/30 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>
      
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
        {activity.title}
      </h3>
      
      <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>{formatDate(activity.startTime)} - {formatDate(activity.endTime)}</span>
        </div>
        
        {activity.location && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">location_on</span>
            <span className="truncate">{activity.location}</span>
          </div>
        )}
        
        {activity.customer && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">business</span>
            <span className="truncate">{activity.customer.company || activity.customer.name}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>创建人: {activity.createdBy.name}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">how_to_reg</span>
            {activity._count?.signIns || 0}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">help</span>
            {activity._count?.questions || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Mock数据
const mockActivities: PresalesActivity[] = [
  {
    id: '1',
    title: '华为数字化转型产品演示',
    type: 'demo',
    description: '针对华为IT部门的产品演示',
    location: '深圳市南山区华为基地',
    startTime: '2026-03-20T14:00:00Z',
    endTime: '2026-03-20T16:00:00Z',
    status: 'approved',
    approvalStatus: 'approved',
    customer: { id: 'c1', name: '华为技术有限公司', company: '华为' },
    createdBy: { id: 'u1', name: 'Alex Chen' },
    _count: { signIns: 25, questions: 8 },
    createdAt: '2026-03-15T08:00:00Z',
  },
  {
    id: '2',
    title: '阿里云智能客服POC测试',
    type: 'poc',
    description: '智能客服系统POC验证',
    location: '杭州市阿里巴巴西溪园区',
    startTime: '2026-03-22T09:00:00Z',
    endTime: '2026-03-22T17:00:00Z',
    status: 'pending_approval',
    approvalStatus: 'pending',
    customer: { id: 'c2', name: '阿里巴巴集团', company: '阿里巴巴' },
    createdBy: { id: 'u2', name: 'Sarah Wang' },
    _count: { signIns: 0, questions: 0 },
    createdAt: '2026-03-17T10:00:00Z',
  },
  {
    id: '3',
    title: '销售团队产品培训',
    type: 'training',
    location: '公司总部会议室',
    startTime: '2026-03-25T09:00:00Z',
    endTime: '2026-03-25T12:00:00Z',
    status: 'draft',
    approvalStatus: 'none',
    createdBy: { id: 'u3', name: 'Mike Liu' },
    _count: { signIns: 0, questions: 0 },
    createdAt: '2026-03-17T11:00:00Z',
  },
];

export default function ActivitiesList() {
  const [activities, setActivities] = useState<PresalesActivity[]>(mockActivities);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 筛选活动
  const filteredActivities = activities.filter(activity => {
    if (statusFilter !== 'all' && activity.status !== statusFilter) return false;
    if (typeFilter !== 'all' && activity.type !== typeFilter) return false;
    if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">售前活动管理</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理演示、培训、POC等售前活动</p>
        </div>
        <Link
          to="/presales/activities/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          新建活动
        </Link>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="搜索活动..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          
          {/* 状态筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">状态:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">全部</option>
              <option value="draft">草稿</option>
              <option value="pending_approval">待审批</option>
              <option value="approved">已批准</option>
              <option value="ongoing">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          {/* 类型筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">类型:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">全部</option>
              <option value="demo">产品演示</option>
              <option value="poc">POC测试</option>
              <option value="training">培训活动</option>
              <option value="seminar">研讨会</option>
            </select>
          </div>
        </div>
      </div>

      {/* 活动列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
            event_busy
          </span>
          <p className="mt-4 text-slate-500 dark:text-slate-400">暂无活动</p>
          <Link
            to="/presales/activities/create"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            创建第一个活动
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}