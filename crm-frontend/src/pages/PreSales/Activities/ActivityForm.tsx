import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 活动类型选项
const activityTypes = [
  { value: 'demo', label: '产品演示' },
  { value: 'poc', label: 'POC测试' },
  { value: 'training', label: '培训活动' },
  { value: 'seminar', label: '研讨会' },
  { value: 'other', label: '其他' },
];

interface ActivityFormProps {
  mode?: 'create' | 'edit';
}

export default function ActivityForm({ mode: propMode }: ActivityFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // 根据URL参数和props决定模式
  const mode = propMode || (id ? 'edit' : 'create');
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'demo',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    customerId: '',
  });

  // 加载活动数据（编辑模式）
  useEffect(() => {
    if (mode === 'edit' && id) {
      // TODO: 调用API获取活动数据
      // 模拟加载
      setLoading(true);
      setTimeout(() => {
        setFormData({
          title: '华为数字化转型产品演示',
          type: 'demo',
          description: '针对华为IT部门的产品演示',
          location: '深圳市南山区华为基地',
          startTime: '2026-03-20T14:00',
          endTime: '2026-03-20T16:00',
          customerId: '',
        });
        setLoading(false);
      }, 500);
    }
  }, [mode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: 调用API创建/更新活动
      console.log('Submit form data:', formData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/presales/activities');
    } catch (error) {
      console.error('Failed to save activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('请填写必要信息');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: 调用API创建活动并提交审批
      console.log('Submit for approval:', formData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/presales/activities');
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === 'create' ? '创建新活动' : '编辑活动'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            填写活动基本信息，提交后可进行审批流程
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 活动标题 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              活动标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="请输入活动标题"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* 活动类型 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              活动类型 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* 时间设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                开始时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                结束时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              活动地点
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="请输入活动地点"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* 活动描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              活动描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入活动描述..."
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* 关联客户 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              关联客户
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索客户..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">可选，关联客户后可查看客户详情</p>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/presales/activities')}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存草稿'}
            </button>
            <button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={loading}
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? '提交中...' : '提交审批'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}