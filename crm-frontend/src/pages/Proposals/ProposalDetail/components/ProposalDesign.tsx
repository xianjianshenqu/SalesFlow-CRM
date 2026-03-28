import { useState, useEffect } from 'react';
import type { Proposal } from '../../../../services/api';
import type { ProposalTemplate } from '../../../../services/api';
import type { ProductPricing } from '../../../../services/api';
import { proposalApi, knowledgeApi } from '../../../../services/api';

interface ProposalDesignProps {
  proposalId: string;
  proposal: Proposal;
  onComplete: () => void;
}

export default function ProposalDesign({ proposalId, proposal, onComplete }: ProposalDesignProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  
  // 知识库产品选择相关状态
  const [showProductModal, setShowProductModal] = useState(false);
  const [knowledgeProducts, setKnowledgeProducts] = useState<ProductPricing[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // 表单数据
  const [formData, setFormData] = useState({
    title: proposal.title || '',
    value: proposal.value || 0,
    description: proposal.description || '',
    products: proposal.products || [],
    terms: proposal.terms || '',
  });

  // 加载模板
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await proposalApi.getTemplates({ limit: 10 });
        setTemplates(response.data.data || []);
      } catch (err) {
        console.error('加载模板失败:', err);
      }
    };
    fetchTemplates();
  }, []);

  // 加载知识库产品列表
  const loadKnowledgeProducts = async (search?: string) => {
    try {
      setProductLoading(true);
      const response = await knowledgeApi.getProducts({ limit: 50, search });
      setKnowledgeProducts(response.data.data || []);
    } catch (err) {
      console.error('加载产品列表失败:', err);
    } finally {
      setProductLoading(false);
    }
  };

  // 打开产品选择模态框
  const handleOpenProductModal = () => {
    setShowProductModal(true);
    setSelectedProducts(new Set());
    loadKnowledgeProducts();
  };

  // 确认选择产品
  const handleConfirmProducts = () => {
    const newProducts = knowledgeProducts
      .filter(p => selectedProducts.has(p.id))
      .map(p => ({
        name: p.productName,
        quantity: 1,
        unitPrice: p.unitPrice,
        totalPrice: p.unitPrice,
        description: p.specification || p.notes || '',
        priority: 'essential' as const,
      }));
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, ...newProducts],
    }));
    setShowProductModal(false);
    setSelectedProducts(new Set());
  };

  // 切换产品选择
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // AI匹配模板
  const handleMatchTemplate = async () => {
    try {
      setMatchLoading(true);
      const response = await proposalApi.matchTemplate(proposalId, {
        industry: proposal.customer?.company,
      });
      setTemplates(response.data);
    } catch (err) {
      console.error('匹配模板失败:', err);
    } finally {
      setMatchLoading(false);
    }
  };

  // 应用模板
  const handleApplyTemplate = async (templateId: string) => {
    try {
      setLoading(true);
      await proposalApi.applyTemplate(proposalId, templateId);
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          products: template.products || [],
          terms: template.terms || '',
        }));
      }
      setSelectedTemplateId(templateId);
      alert('模板应用成功');
    } catch (err) {
      console.error('应用模板失败:', err);
      alert('应用模板失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存设计
  const handleSave = async () => {
    try {
      setLoading(true);
      await proposalApi.updateDesign(proposalId, formData);
      alert('保存成功');
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 确认方案
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await proposalApi.updateDesign(proposalId, formData);
      await proposalApi.confirmDesign(proposalId);
      onComplete();
    } catch (err) {
      console.error('确认失败:', err);
      alert('确认失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加产品
  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, {
        name: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        description: '',
        priority: 'essential',
      }],
    }));
  };

  // 更新产品
  const handleUpdateProduct = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const products = [...prev.products];
      products[index] = { ...products[index], [field]: value };
      
      // 计算总价
      if (field === 'quantity' || field === 'unitPrice') {
        products[index].totalPrice = products[index].quantity * products[index].unitPrice;
      }
      
      return { ...prev, products };
    });
  };

  // 删除产品
  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  // 计算总金额
  const totalValue = formData.products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* 模板选择 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">方案模板</h2>
          <button
            onClick={handleMatchTemplate}
            disabled={matchLoading}
            className="flex items-center gap-2 px-4 py-2 text-purple-500 hover:text-purple-600 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            {matchLoading ? '匹配中...' : 'AI智能匹配'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.slice(0, 6).map((template) => (
            <div
              key={template.id}
              onClick={() => handleApplyTemplate(template.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedTemplateId === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              <div className="font-medium text-slate-900 dark:text-white mb-1">{template.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{template.category}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{template.description}</div>
              {template.matchScore && (
                <div className="mt-2 text-xs text-purple-500">匹配度: {template.matchScore}%</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 方案内容 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">方案内容</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {loading ? '处理中...' : '确认并提交评审'}
            </button>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">方案标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">方案金额</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">方案描述</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg resize-none"
          />
        </div>

        {/* 产品配置 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">产品配置</label>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenProductModal}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <span className="material-symbols-outlined text-lg">inventory_2</span>
                从知识库选择
              </button>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                手动添加
              </button>
            </div>
          </div>
          
          {formData.products.length > 0 ? (
            <div className="space-y-3">
              {formData.products.map((product, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleUpdateProduct(index, 'name', e.target.value)}
                    placeholder="产品名称"
                    className="col-span-3 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleUpdateProduct(index, 'quantity', Number(e.target.value))}
                    placeholder="数量"
                    className="col-span-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={product.unitPrice}
                    onChange={(e) => handleUpdateProduct(index, 'unitPrice', Number(e.target.value))}
                    placeholder="单价"
                    className="col-span-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                  <div className="col-span-2 text-sm text-slate-600 dark:text-slate-400">
                    ¥{product.totalPrice?.toLocaleString() || 0}
                  </div>
                  <select
                    value={product.priority}
                    onChange={(e) => handleUpdateProduct(index, 'priority', e.target.value)}
                    className="col-span-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    <option value="essential">必需</option>
                    <option value="recommended">推荐</option>
                    <option value="optional">可选</option>
                  </select>
                  <button
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}
              <div className="text-right font-medium text-slate-900 dark:text-white">
                合计: ¥{totalValue.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              暂无产品，点击上方按钮添加
            </div>
          )}
        </div>

        {/* 条款 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">条款说明</label>
          <textarea
            value={formData.terms}
            onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
            rows={4}
            placeholder="付款条件、交付周期、售后服务等..."
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg resize-none"
          />
        </div>
      </div>

      {/* 产品选择模态框 */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowProductModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col m-4">
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">从知识库选择产品</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* 搜索栏 */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    loadKnowledgeProducts(e.target.value);
                  }}
                  placeholder="搜索产品名称或类别..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </div>
            
            {/* 产品列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              {productLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : knowledgeProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                  <p>知识库中暂无产品数据</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {knowledgeProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => toggleProductSelection(product.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedProducts.has(product.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">{product.productName}</span>
                            {product.productCode && (
                              <span className="text-xs text-slate-400">{product.productCode}</span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {product.category && <span className="mr-2">分类: {product.category}</span>}
                            {product.specification && <span>规格: {product.specification}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">¥{product.unitPrice.toLocaleString()}</div>
                          {product.unit && <div className="text-xs text-slate-400">/{product.unit}</div>}
                        </div>
                      </div>
                      {selectedProducts.has(product.id) && (
                        <div className="mt-2 flex items-center text-primary text-sm">
                          <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                          已选择
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 底部操作栏 */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                已选择 {selectedProducts.size} 个产品
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmProducts}
                  disabled={selectedProducts.size === 0}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90"
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}