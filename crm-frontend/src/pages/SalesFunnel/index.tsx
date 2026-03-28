import { useState, useCallback, useRef } from 'react';
import { useFunnelStore } from '../../stores/funnelStore';
import { STAGE_LABELS, STAGE_COLORS, type Opportunity, type Stage, type Priority } from '../../types';

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 阶段颜色配置
const STAGE_DOT_COLORS: Record<Stage, string> = {
  new_lead: 'bg-slate-500',
  contacted: 'bg-cyan-500',
  solution: 'bg-violet-500',
  quoted: 'bg-indigo-500',
  negotiation: 'bg-blue-500',
  procurement_process: 'bg-amber-500',
  contract_stage: 'bg-orange-500',
  won: 'bg-emerald-500'
};

// 删除确认对话框
function DeleteConfirmDialog({
  opportunity,
  onConfirm,
  onCancel
}: {
  opportunity: Opportunity;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">delete</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">确认删除</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">此操作无法撤销</p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          确定要删除机会 "<span className="font-medium text-slate-900 dark:text-white">{opportunity.title}</span>" 吗？
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

// 编辑表单模态框
function EditOpportunityModal({
  opportunity,
  onSave,
  onCancel
}: {
  opportunity: Opportunity;
  onSave: (data: Partial<Opportunity>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(opportunity.title);
  const [customerName, setCustomerName] = useState(opportunity.customerName);
  const [value, setValue] = useState(opportunity.value.toString());
  const [priority, setPriority] = useState<Priority>(opportunity.priority);
  const [probability, setProbability] = useState(opportunity.probability);
  const [nextStep, setNextStep] = useState(opportunity.nextStep || '');
  const [description, setDescription] = useState(opportunity.description || '');

  const handleSave = () => {
    if (title.trim() && customerName.trim()) {
      onSave({
        title: title.trim(),
        customerName: customerName.trim(),
        value: parseFloat(value) || 0,
        priority,
        probability,
        nextStep: nextStep.trim(),
        description: description.trim()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">编辑机会</h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* 客户名称 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              客户名称
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 项目名称 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              项目名称
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 金额 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              预计金额 (¥)
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 成交概率 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              成交概率: {probability}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              优先级
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-2 ring-red-500'
                        : p === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 ring-2 ring-slate-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                </button>
              ))}
            </div>
          </div>

          {/* 下一步 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              下一步行动
            </label>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="输入下一步行动计划..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              备注
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="添加备注信息..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !customerName.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            保存更改
          </button>
        </div>
      </div>
    </div>
  );
}

// 机会卡片组件 - 支持拖拽和操作
function OpportunityCard({ 
  opportunity, 
  onDragStart, 
  onDragEnd,
  onEdit,
  onDelete
}: { 
  opportunity: Opportunity;
  onDragStart: (e: React.DragEvent, opportunity: Opportunity) => void;
  onDragEnd: () => void;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-slate-300'
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, opportunity)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`relative bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 ${priorityColors[opportunity.priority]} cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
    >
      {/* 操作按钮 - 悬停显示 */}
      <div 
        className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(opportunity);
          }}
          className="size-7 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
          title="编辑"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(opportunity);
          }}
          className="size-7 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
          title="删除"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      {/* 标题和概率 */}
      <div className="flex items-start justify-between mb-2 pr-16">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
          {opportunity.title}
        </h4>
        <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded shrink-0">
          {opportunity.probability}%
        </span>
      </div>

      {/* 客户名称 */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate">
        {opportunity.customerName}
      </p>

      {/* 金额和负责人 */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-primary text-sm">
          {formatCurrency(opportunity.value)}
        </span>
        <div className="flex items-center gap-1">
          <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
              {opportunity.owner.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>

      {/* 下一步 */}
      {opportunity.nextStep && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">下一步:</span> {opportunity.nextStep}
          </p>
        </div>
      )}
    </div>
  );
}

// 添加客户表单组件 - 完整表单格式
interface AddCustomerFormData {
  customerName: string;
  title: string;
  value: string;
  probability: number;
  priority: Priority;
  nextStep: string;
  description: string;
}

function AddCustomerForm({
  stage,
  onAdd
}: {
  stage: Stage;
  onAdd: (data: Omit<Opportunity, 'id' | 'customerId' | 'owner' | 'lastActivity' | 'expectedCloseDate'>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<AddCustomerFormData>({
    customerName: '',
    title: '',
    value: '',
    probability: getDefaultProbability(stage),
    priority: 'medium',
    nextStep: '',
    description: ''
  });

  // 根据阶段获取默认概率
  function getDefaultProbability(s: Stage): number {
    const stageProbabilities: Record<Stage, number> = {
      new_lead: 20,
      contacted: 30,
      solution: 40,
      quoted: 50,
      negotiation: 55,
      procurement_process: 70,
      contract_stage: 85,
      won: 100
    };
    return stageProbabilities[s];
  }

  const handleSubmit = () => {
    if (formData.customerName.trim() && formData.title.trim()) {
      onAdd({
        customerName: formData.customerName.trim(),
        title: formData.title.trim(),
        value: parseFloat(formData.value) || 0,
        stage,
        probability: formData.probability,
        priority: formData.priority,
        nextStep: formData.nextStep.trim(),
        description: formData.description.trim()
      });
      // 重置表单
      setFormData({
        customerName: '',
        title: '',
        value: '',
        probability: getDefaultProbability(stage),
        priority: 'medium',
        nextStep: '',
        description: ''
      });
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setFormData({
      customerName: '',
      title: '',
      value: '',
      probability: getDefaultProbability(stage),
      priority: 'medium',
      nextStep: '',
      description: ''
    });
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        <span className="text-sm">添加客户</span>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="space-y-3">
        {/* 客户名称 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            客户名称
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* 项目名称 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            项目名称
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* 预计金额 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            预计金额 (¥)
          </label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* 成交概率 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            成交概率: {formData.probability}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 优先级 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            优先级
          </label>
          <div className="flex gap-1">
            {(['high', 'medium', 'low'] as Priority[]).map((p) => (
              <button
                key={p}
                onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                  formData.priority === p
                    ? p === 'high'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-500'
                      : p === 'medium'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
              </button>
            ))}
          </div>
        </div>

        {/* 下一步行动 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            下一步行动
          </label>
          <input
            type="text"
            value={formData.nextStep}
            onChange={(e) => setFormData(prev => ({ ...prev, nextStep: e.target.value }))}
            placeholder="输入下一步行动计划..."
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            备注
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            placeholder="添加备注信息..."
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={!formData.customerName.trim() || !formData.title.trim()}
          className="flex-1 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          添加
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-slate-500 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}

// 阶段列组件 - 支持放置
function StageColumn({
  stage,
  opportunities,
  totalValue,
  onDragOver,
  onDrop,
  onAddCustomer,
  onEditOpportunity,
  onDeleteOpportunity,
  draggedOpportunity
}: {
  stage: Stage;
  opportunities: Opportunity[];
  totalValue: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: Stage) => void;
  onAddCustomer: (stage: Stage, data: Omit<Opportunity, 'id' | 'customerId' | 'owner' | 'lastActivity' | 'expectedCloseDate'>) => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  onDeleteOpportunity: (opportunity: Opportunity) => void;
  draggedOpportunity: Opportunity | null;
}) {
  const colors = STAGE_COLORS[stage];
  const isOver = draggedOpportunity !== null && draggedOpportunity.stage !== stage;

  const handleDragStart = (e: React.DragEvent, opportunity: Opportunity) => {
    e.dataTransfer.setData('opportunityId', opportunity.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    // 拖拽结束处理在父组件
  };

  return (
    <div 
      className={`flex-1 min-w-[280px] max-w-[320px] bg-slate-50 dark:bg-slate-900/50 rounded-xl transition-all ${isOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
    >
      {/* 列头 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${STAGE_DOT_COLORS[stage]}`}></div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{STAGE_LABELS[stage]}</h3>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            {opportunities.length}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          总价值: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalValue)}</span>
        </p>
      </div>

      {/* 卡片列表 */}
      <div className="p-4 space-y-3 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto">
        {opportunities.map((opportunity) => (
          <OpportunityCard 
            key={opportunity.id} 
            opportunity={opportunity}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onEdit={onEditOpportunity}
            onDelete={onDeleteOpportunity}
          />
        ))}
        
        {opportunities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-600">
            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
            <p className="text-sm">暂无机会</p>
          </div>
        )}
      </div>

      {/* 添加客户表单 */}
      <div className="p-4 pt-0">
        <AddCustomerForm
          stage={stage}
          onAdd={(data) => onAddCustomer(stage, data)}
        />
      </div>
    </div>
  );
}

// 漏斗统计卡片
function FunnelStats() {
  const { opportunities } = useFunnelStore();
  const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0);
  const weightedValue = opportunities.reduce((sum, o) => sum + (o.value * o.probability / 100), 0);
  const avgProbability = opportunities.length > 0 
    ? Math.round(opportunities.reduce((sum, o) => sum + o.probability, 0) / opportunities.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">总机会数</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{opportunities.length}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">总价值</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalValue)}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">加权价值</p>
        <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(weightedValue)}</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">平均成交率</p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">{avgProbability}%</p>
      </div>
    </div>
  );
}

export default function SalesFunnel() {
  const { opportunities, moveOpportunity, addOpportunity, updateOpportunity, deleteOpportunity } = useFunnelStore();
  const [draggedOpportunity, setDraggedOpportunity] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState<Opportunity | null>(null);
  const nextIdRef = useRef(100);

  const stages: Stage[] = ['new_lead', 'quoted', 'negotiation', 'procurement_process', 'contract_stage', 'won'];

  const getOpportunitiesByStage = useCallback((stage: Stage) => 
    opportunities.filter(o => o.stage === stage),
    [opportunities]
  );

  const getStageTotalValue = useCallback((stage: Stage) => 
    getOpportunitiesByStage(stage).reduce((sum, o) => sum + o.value, 0),
    [getOpportunitiesByStage]
  );

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, newStage: Stage) => {
    e.preventDefault();
    const opportunityId = e.dataTransfer.getData('opportunityId');
    const opportunity = opportunities.find(o => o.id === opportunityId);
    
    if (opportunity && opportunity.stage !== newStage) {
      try {
        await moveOpportunity(opportunityId, newStage);
      } catch (error) {
        console.error('Failed to move opportunity:', error);
      }
    }
    setDraggedOpportunity(null);
  }, [opportunities, moveOpportunity]);

  // 添加客户
  const handleAddCustomer = useCallback((_stage: Stage, data: Omit<Opportunity, 'id' | 'customerId' | 'owner' | 'lastActivity' | 'expectedCloseDate'>) => {
    const newOpportunity: Opportunity = {
      id: `o${nextIdRef.current++}`,
      customerId: `c${nextIdRef.current}`,
      customerName: data.customerName,
      title: data.title,
      stage: data.stage,
      value: data.value || 0,
      probability: data.probability,
      owner: '当前用户',
      priority: data.priority,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      description: data.description || '',
      nextStep: data.nextStep || ''
    };

    addOpportunity(newOpportunity);
  }, [addOpportunity]);

  // 编辑保存
  const handleEditSave = useCallback(async (data: Partial<Opportunity>) => {
    if (editingOpportunity) {
      try {
        await updateOpportunity(editingOpportunity.id, data);
        setEditingOpportunity(null);
      } catch (error) {
        console.error('Failed to update opportunity:', error);
      }
    }
  }, [editingOpportunity, updateOpportunity]);

  // 删除确认
  const handleDeleteConfirm = useCallback(async () => {
    if (deletingOpportunity) {
      try {
        await deleteOpportunity(deletingOpportunity.id);
        setDeletingOpportunity(null);
      } catch (error) {
        console.error('Failed to delete opportunity:', error);
      }
    }
  }, [deletingOpportunity, deleteOpportunity]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">销售漏斗</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">拖拽卡片更改阶段 · 悬停卡片显示操作按钮</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <FunnelStats />

      {/* 看板视图 */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            opportunities={getOpportunitiesByStage(stage)}
            totalValue={getStageTotalValue(stage)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onAddCustomer={handleAddCustomer}
            onEditOpportunity={setEditingOpportunity}
            onDeleteOpportunity={setDeletingOpportunity}
            draggedOpportunity={draggedOpportunity}
          />
        ))}
      </div>

      {/* 编辑模态框 */}
      {editingOpportunity && (
        <EditOpportunityModal
          opportunity={editingOpportunity}
          onSave={handleEditSave}
          onCancel={() => setEditingOpportunity(null)}
        />
      )}

      {/* 删除确认对话框 */}
      {deletingOpportunity && (
        <DeleteConfirmDialog
          opportunity={deletingOpportunity}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingOpportunity(null)}
        />
      )}
    </div>
  );
}