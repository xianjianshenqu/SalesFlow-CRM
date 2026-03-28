import { useState, useEffect, useCallback } from 'react';
import { knowledgeApi } from '../../services/api';
import type { ContractTemplate as ContractTemplateType } from '../../services/api';

// 状态标签
function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      有效
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
      无效
    </span>
  );
}

// 变量标签
function VariableTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
      {'{{'}{name}{'}}'}
    </span>
  );
}

// 模板表单模态框
interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ContractTemplateType | null;
  onSuccess: () => void;
}

function TemplateModal({ isOpen, onClose, template, onSuccess }: TemplateModalProps) {
  const [formData, setFormData] = useState<Partial<ContractTemplateType>>({
    name: '',
    category: '',
    description: '',
    content: '',
    variables: [],
    tags: [],
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newVariable, setNewVariable] = useState({ name: '', type: 'string', defaultValue: '' });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        description: template.description || '',
        content: template.content,
        variables: template.variables || [],
        tags: template.tags || [],
        isActive: template.isActive,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        description: '',
        content: '',
        variables: [],
        tags: [],
        isActive: true,
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('请输入模板名称');
      return;
    }
    if (!formData.category) {
      setError('请输入模板分类');
      return;
    }
    if (!formData.content) {
      setError('请输入模板内容');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (template) {
        await knowledgeApi.updateContract(template.id, formData);
      } else {
        await knowledgeApi.createContract(formData);
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('保存模板失败:', err);
      setError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const addVariable = () => {
    if (!newVariable.name) return;
    setFormData({
      ...formData,
      variables: [...(formData.variables || []), { ...newVariable }],
    });
    setNewVariable({ name: '', type: 'string', defaultValue: '' });
  };

  const removeVariable = (index: number) => {
    setFormData({
      ...formData,
      variables: formData.variables?.filter((_, i) => i !== index) || [],
    });
  };

  const addTag = () => {
    if (!newTag) return;
    if (formData.tags?.includes(newTag)) return;
    setFormData({
      ...formData,
      tags: [...(formData.tags || []), newTag],
    });
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {template ? '编辑模板' : '新增模板'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                模板名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="输入模板名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                分类 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="输入分类，如：销售合同"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              描述
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="输入模板描述"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              模板内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
              rows={8}
              placeholder="输入合同模板内容，使用 {{变量名}} 作为占位符"
            />
            <p className="text-xs text-slate-500 mt-1">
              提示：使用 {'{{变量名}}'} 格式定义变量，如：{'{{客户名称}}'}
            </p>
          </div>
          
          {/* 变量管理 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              变量定义
            </label>
            <div className="space-y-2">
              {formData.variables?.map((variable, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <VariableTag name={variable.name} />
                  <span className="text-sm text-slate-500">{variable.type}</span>
                  {variable.defaultValue && (
                    <span className="text-sm text-slate-400">默认: {variable.defaultValue}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="ml-auto text-slate-400 hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  placeholder="变量名"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
                <select
                  value={newVariable.type}
                  onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value })}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="string">字符串</option>
                  <option value="number">数字</option>
                  <option value="date">日期</option>
                  <option value="boolean">布尔</option>
                </select>
                <input
                  type="text"
                  value={newVariable.defaultValue}
                  onChange={(e) => setNewVariable({ ...newVariable, defaultValue: e.target.value })}
                  placeholder="默认值"
                  className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={addVariable}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
          
          {/* 标签管理 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              标签
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="添加标签"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                添加
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
              模板有效
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 预览模态框
function PreviewModal({ isOpen, onClose, template }: { isOpen: boolean; onClose: () => void; template: ContractTemplateType | null }) {
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    if (template) {
      // 初始化预览数据
      const initialData: Record<string, string> = {};
      template.variables?.forEach(v => {
        initialData[v.name] = v.defaultValue || '';
      });
      setPreviewData(initialData);
      setPreviewContent(template.content);
    }
  }, [template]);

  useEffect(() => {
    if (template) {
      let content = template.content;
      // 替换变量
      Object.entries(previewData).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
      });
      setPreviewContent(content);
    }
  }, [previewData, template]);

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">预览模板: {template.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* 变量输入 */}
          <div className="lg:col-span-1 space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-white">填写变量</h4>
            {template.variables && template.variables.length > 0 ? (
              template.variables.map((variable) => (
                <div key={variable.name}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {variable.name}
                  </label>
                  <input
                    type={variable.type === 'date' ? 'date' : variable.type === 'number' ? 'number' : 'text'}
                    value={previewData[variable.name] || ''}
                    onChange={(e) => setPreviewData({ ...previewData, [variable.name]: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder={variable.defaultValue || `输入${variable.name}`}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">此模板无变量</p>
            )}
          </div>
          
          {/* 预览内容 */}
          <div className="lg:col-span-2">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">预览结果</h4>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300 min-h-[400px]">
              {previewContent}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractTemplates() {
  const [templates, setTemplates] = useState<ContractTemplateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplateType | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplateType | null>(null);
  
  const itemsPerPage = 9;

  // 获取模板列表
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await knowledgeApi.getContracts(params);
      setTemplates(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('获取模板列表失败:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // 删除模板
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此模板吗？')) return;
    
    try {
      await knowledgeApi.deleteContract(id);
      fetchTemplates();
    } catch (err) {
      console.error('删除模板失败:', err);
      alert('删除失败，请重试');
    }
  };

  // 获取所有类别
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">合同模板</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理和预览合同模板库</p>
        </div>
        <button 
          onClick={() => {
            setEditingTemplate(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          新增模板
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索模板名称..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">所有分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 模板卡片网格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2">description</span>
          <p>暂无模板数据</p>
          <button 
            onClick={() => {
              setEditingTemplate(null);
              setShowModal(true);
            }}
            className="mt-4 text-primary hover:underline"
          >
            创建第一个模板
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-xl">description</span>
                  </div>
                  <StatusBadge isActive={template.isActive} />
                </div>
                
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">{template.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{template.description || '暂无描述'}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                    {template.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    使用 {template.usageCount} 次
                  </span>
                </div>
                
                {template.variables && template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.variables.slice(0, 3).map((v) => (
                      <VariableTag key={v.name} name={v.name} />
                    ))}
                    {template.variables.length > 3 && (
                      <span className="text-xs text-slate-400">+{template.variables.length - 3}</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      setPreviewTemplate(template);
                      setShowPreviewModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    预览
                  </button>
                  <button 
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="删除"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              第 {currentPage} 页，共 {totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}

      {/* 模板表单模态框 */}
      <TemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        template={editingTemplate}
        onSuccess={fetchTemplates}
      />

      {/* 预览模态框 */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        template={previewTemplate}
      />
    </div>
  );
}
