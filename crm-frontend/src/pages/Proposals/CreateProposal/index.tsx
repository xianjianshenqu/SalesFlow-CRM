import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proposalApi, customerApi } from '../../../services/api';
import type { Customer, ProposalTemplate } from '../../../services/api';

// 步骤配置
const STEPS = [
  { num: 1, title: '选择客户', icon: 'person' },
  { num: 2, title: '选择模板', icon: 'content_copy' },
  { num: 3, title: '基本信息', icon: 'edit_document' },
  { num: 4, title: '确认创建', icon: 'check_circle' },
];

export default function CreateProposal() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState({
    customerId: '',
    templateId: '',
    title: '',
    value: 0,
    description: '',
    products: [] as any[],
    terms: '',
    validUntil: '',
    notes: '',
  });
  
  // 下拉选项数据
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  
  // 加载客户列表
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerApi.getAll({ pageSize: 100 });
        // api.request 已解包后端 { data: [...] }，所以 response.data 直接是客户数组
        setCustomers(response.data || []);
      } catch (err) {
        console.error('加载客户失败:', err);
      }
    };
    fetchCustomers();
  }, []);
  
  // 加载模板列表
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await proposalApi.getTemplates({ limit: 50 });
        setTemplates(response.data.data || []);
      } catch (err) {
        console.error('加载模板失败:', err);
      }
    };
    fetchTemplates();
  }, []);

  // 筛选客户
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 筛选模板
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  // 选择客户
  const handleSelectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      title: prev.title || `${customer.name}商务方案`,
    }));
    setCurrentStep(2);
  };
  
  // 选择模板
  const handleSelectTemplate = (template: ProposalTemplate) => {
    setFormData(prev => ({
      ...prev,
      templateId: template.id,
      products: template.products || [],
      terms: template.terms || '',
    }));
    setCurrentStep(3);
  };
  
  // 跳过模板
  const handleSkipTemplate = () => {
    setFormData(prev => ({ ...prev, templateId: '' }));
    setCurrentStep(3);
  };

  // 提交创建
  const handleSubmit = async () => {
    if (!formData.customerId || !formData.title) {
      alert('请填写必要信息');
      return;
    }
    
    try {
      setLoading(true);
      const response = await proposalApi.create({
        customerId: formData.customerId,
        title: formData.title,
        value: formData.value,
        description: formData.description,
        products: formData.products,
        terms: formData.terms,
        validUntil: formData.validUntil || undefined,
        notes: formData.notes,
      });
      
      // 跳转到详情页开始需求分析
      navigate(`/proposals/${response.data.id}`);
    } catch (err) {
      console.error('创建方案失败:', err);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/proposals')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            返回列表
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">新建商务方案</h1>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`size-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.num 
                    ? 'bg-primary text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {currentStep > step.num ? (
                    <span className="material-symbols-outlined text-lg">check</span>
                  ) : (
                    step.num
                  )}
                </div>
                <p className={`text-sm font-medium mt-2 ${
                  currentStep >= step.num 
                    ? 'text-slate-900 dark:text-white' 
                    : 'text-slate-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-20 h-0.5 mx-2 ${
                  currentStep > step.num 
                    ? 'bg-primary' 
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 步骤1: 选择客户 */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">选择客户</h2>
          
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="搜索客户名称或公司..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.customerId === customer.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-slate-900 dark:text-white">{customer.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{customer.company || '无公司'}</div>
                <div className="text-xs text-slate-400 mt-1">{customer.industry || '未知行业'}</div>
              </div>
            ))}
          </div>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              没有找到客户，请先创建客户
            </div>
          )}
        </div>
      )}

      {/* 步骤2: 选择模板 */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">选择模板（可选）</h2>
          
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="搜索模板..."
              value={templateSearchQuery}
              onChange={(e) => setTemplateSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto mb-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.templateId === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 dark:text-white">{template.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{template.category}</span>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{template.description || '暂无描述'}</div>
                <div className="text-xs text-slate-400 mt-2">使用次数: {template.usageCount}</div>
              </div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400 mb-4">
              没有找到模板
            </div>
          )}
          
          <button
            onClick={handleSkipTemplate}
            className="w-full py-2.5 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            跳过，不使用模板
          </button>
        </div>
      )}

      {/* 步骤3: 填写基本信息 */}
      {currentStep === 3 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">填写基本信息</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                方案标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="请输入方案标题"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  方案金额
                </label>
                <input
                  type="number"
                  value={formData.value || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  有效期至
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                方案描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="请输入方案描述..."
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                备注信息
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="备注..."
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              上一步
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!formData.title}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* 步骤4: 确认创建 */}
      {currentStep === 4 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">确认创建</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-medium text-slate-900 dark:text-white mb-3">方案信息确认</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">客户</span>
                  <span className="text-slate-900 dark:text-white">{customers.find(c => c.id === formData.customerId)?.name || '未选择'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">标题</span>
                  <span className="text-slate-900 dark:text-white">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">金额</span>
                  <span className="text-slate-900 dark:text-white">¥{formData.value.toLocaleString()}</span>
                </div>
                {formData.templateId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">模板</span>
                    <span className="text-slate-900 dark:text-white">{templates.find(t => t.id === formData.templateId)?.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              创建后将进入<strong>需求分析</strong>阶段
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {loading ? '创建中...' : '确认创建'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}