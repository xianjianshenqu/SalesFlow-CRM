/**
 * 新建商机模态框
 * 用于从客户详情页创建新的销售机会
 */

import { useState } from 'react';
import { opportunityApi } from '../../services/api';
import { STAGE_LABELS, type Stage, type Priority } from '../../types';

// 表单输入类型
interface OpportunityFormData {
  title: string;
  value: string;
  stage: Stage;
  probability: number;
  priority: Priority;
  expectedCloseDate: string;
  description: string;
  nextStep: string;
}

// 组件Props
interface CreateOpportunityModalProps {
  customerId: string;
  customerName: string;
  onClose: () => void;
  onSuccess: (opportunity: any) => void;
}

// 阶段默认概率映射
const STAGE_PROBABILITIES: Record<Stage, number> = {
  new_lead: 20,
  contacted: 30,
  solution: 45,
  quoted: 55,
  negotiation: 65,
  procurement_process: 75,
  contract_stage: 85,
  won: 100
};

// 格式化金额显示
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

export default function CreateOpportunityModal({
  customerId,
  customerName,
  onClose,
  onSuccess
}: CreateOpportunityModalProps) {
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    value: '',
    stage: 'new_lead',
    probability: 20,
    priority: 'medium',
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    nextStep: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理阶段变更，自动更新概率
  const handleStageChange = (stage: Stage) => {
    setFormData(prev => ({
      ...prev,
      stage,
      probability: STAGE_PROBABILITIES[stage]
    }));
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('请输入项目名称');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await opportunityApi.create({
        customerId,
        title: formData.title.trim(),
        stage: formData.stage,
        value: parseFloat(formData.value) || 0,
        probability: formData.probability,
        priority: formData.priority,
        expectedCloseDate: formData.expectedCloseDate || undefined,
        description: formData.description.trim() || undefined,
        nextStep: formData.nextStep.trim() || undefined
      });

      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建商机失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">新建商机</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              客户: {customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 项目名称 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例如: 数字化转型项目"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 预计金额 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              预计金额 (¥)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 pr-16 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {formData.value && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ≈ {formatCurrency(parseFloat(formData.value) || 0)}
                </span>
              )}
            </div>
          </div>

          {/* 销售阶段 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              销售阶段
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['new_lead', 'contacted', 'solution', 'quoted', 'negotiation', 'procurement_process', 'contract_stage'] as Stage[]).map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleStageChange(stage)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    formData.stage === stage
                      ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>

          {/* 成交概率 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              成交概率: <span className="text-primary font-semibold">{formData.probability}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              优先级
            </label>
            <div className="flex gap-2">
              {([
                { value: 'high', label: '高', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-red-500' },
                { value: 'medium', label: '中', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-amber-500' },
                { value: 'low', label: '低', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 ring-slate-500' }
              ] as const).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: item.value }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    formData.priority === item.value
                      ? `${item.color} ring-2`
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 预计成交日期 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              预计成交日期
            </label>
            <input
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 下一步行动 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              下一步行动
            </label>
            <input
              type="text"
              value={formData.nextStep}
              onChange={(e) => setFormData(prev => ({ ...prev, nextStep: e.target.value }))}
              placeholder="例如: 安排产品演示会议"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 项目描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="描述项目的背景、需求、痛点等信息..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                创建中...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">add</span>
                创建商机
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}