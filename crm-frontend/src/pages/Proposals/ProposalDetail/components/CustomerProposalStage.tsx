import { useState, useEffect } from 'react';
import type { Proposal } from '../../../../services/api';
import type { CustomerProposalRecord } from '../../../../services/api';
import type { ContractTemplate } from '../../../../services/api';
import { proposalApi, knowledgeApi } from '../../../../services/api';

interface CustomerProposalStageProps {
  proposalId: string;
  proposal: Proposal;
  onComplete: () => void;
}

export default function CustomerProposalStage({ proposalId, proposal, onComplete }: CustomerProposalStageProps) {
  const [loading, setLoading] = useState(false);
  const [customerProposal, setCustomerProposal] = useState<CustomerProposalRecord | null>(null);
  
  // 合同模板选择相关状态
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractSearch, setContractSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<ContractTemplate | null>(null);
  const [previewContract, setPreviewContract] = useState<ContractTemplate | null>(null);
  
  // 邮件表单
  const [emailForm, setEmailForm] = useState({
    emailTo: proposal.customer?.email || '',
    emailCc: [] as string[],
    emailSubject: '',
    emailBody: '',
  });

  // 加载客户提案信息
  useEffect(() => {
    const fetchCustomerProposal = async () => {
      try {
        const response = await proposalApi.getCustomerProposal(proposalId);
        setCustomerProposal(response.data);
        if (response.data) {
          setEmailForm({
            emailTo: response.data.emailTo,
            emailCc: response.data.emailCc || [],
            emailSubject: response.data.emailSubject || '',
            emailBody: response.data.emailBody || '',
          });
        }
      } catch (err) {
        console.error('加载客户提案失败:', err);
      }
    };
    fetchCustomerProposal();
  }, [proposalId]);

  // 加载合同模板列表
  const loadContractTemplates = async (search?: string) => {
    try {
      setContractLoading(true);
      const response = await knowledgeApi.getContracts({ limit: 50, search });
      setContractTemplates(response.data.data || []);
    } catch (err) {
      console.error('加载合同模板失败:', err);
    } finally {
      setContractLoading(false);
    }
  };

  // 打开合同模板选择模态框
  const handleOpenContractModal = () => {
    setShowContractModal(true);
    setSelectedContract(null);
    loadContractTemplates();
  };

  // 填充模板变量
  const fillTemplateVariables = (content: string): string => {
    // 获取方案上下文数据
    const customerName = proposal.customer?.name || '客户';
    const customerCompany = proposal.customer?.company || proposal.customer?.shortName || '';
    const proposalTitle = proposal.title || '商务方案';
    const proposalValue = proposal.value ? `¥${proposal.value.toLocaleString()}` : '';
    const productNames = proposal.products?.map(p => p.name).join('、') || '';
    const currentDate = new Date().toLocaleDateString('zh-CN');
    
    // 替换模板变量
    return content
      .replace(/\{\{客户名称\}\}/g, customerName)
      .replace(/\{\{companyName\}\}/g, customerName)
      .replace(/\{\{客户公司\}\}/g, customerCompany)
      .replace(/\{\{company\}\}/g, customerCompany)
      .replace(/\{\{方案标题\}\}/g, proposalTitle)
      .replace(/\{\{proposalTitle\}\}/g, proposalTitle)
      .replace(/\{\{方案金额\}\}/g, proposalValue)
      .replace(/\{\{amount\}\}/g, proposalValue)
      .replace(/\{\{产品列表\}\}/g, productNames)
      .replace(/\{\{products\}\}/g, productNames)
      .replace(/\{\{当前日期\}\}/g, currentDate)
      .replace(/\{\{date\}\}/g, currentDate);
  };

  // 应用选中的合同模板
  const handleApplyContract = () => {
    if (!selectedContract) return;
    
    const filledContent = fillTemplateVariables(selectedContract.content);
    setEmailForm(prev => ({
      ...prev,
      emailBody: prev.emailBody 
        ? `${prev.emailBody}\n\n---\n\n${filledContent}`
        : filledContent,
    }));
    setShowContractModal(false);
    setSelectedContract(null);
  };

  // 生成邮件模板
  const handleGenerateEmail = async () => {
    try {
      setLoading(true);
      const response = await proposalApi.generateEmailTemplate(proposalId);
      setEmailForm(prev => ({
        ...prev,
        emailSubject: response.data.subject,
        emailBody: response.data.body,
      }));
    } catch (err) {
      console.error('生成邮件失败:', err);
      alert('生成邮件模板失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存邮件
  const handleSaveEmail = async () => {
    try {
      setLoading(true);
      if (customerProposal) {
        await proposalApi.updateCustomerProposalEmail(proposalId, emailForm);
      } else {
        const response = await proposalApi.createCustomerProposal(proposalId, emailForm);
        setCustomerProposal(response.data);
      }
      alert('保存成功');
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 发送邮件
  const handleSendEmail = async () => {
    if (!emailForm.emailTo) {
      alert('请填写收件人邮箱');
      return;
    }
    
    if (!confirm('确认发送邮件给客户？')) return;
    
    try {
      setLoading(true);
      // 先保存
      if (!customerProposal) {
        await proposalApi.createCustomerProposal(proposalId, emailForm);
      } else {
        await proposalApi.updateCustomerProposalEmail(proposalId, emailForm);
      }
      // 发送
      await proposalApi.sendCustomerProposal(proposalId);
      onComplete();
    } catch (err) {
      console.error('发送失败:', err);
      alert('发送失败');
    } finally {
      setLoading(false);
    }
  };

  // 发送状态配置
  const sendStatusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'text-slate-500' },
    sent: { label: '已发送', color: 'text-blue-500' },
    delivered: { label: '已送达', color: 'text-emerald-500' },
    opened: { label: '已打开', color: 'text-purple-500' },
    failed: { label: '发送失败', color: 'text-red-500' },
  };

  return (
    <div className="space-y-6">
      {/* 发送状态 */}
      {customerProposal && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">发送状态</h2>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
              <span className="material-symbols-outlined text-2xl text-blue-500">send</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">发送时间</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {customerProposal.sentAt ? new Date(customerProposal.sentAt).toLocaleString() : '-'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
              <span className="material-symbols-outlined text-2xl text-emerald-500">mark_email_read</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">送达时间</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {customerProposal.deliveredAt ? new Date(customerProposal.deliveredAt).toLocaleString() : '-'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
              <span className="material-symbols-outlined text-2xl text-purple-500">visibility</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">打开次数</p>
              <p className="font-medium text-slate-900 dark:text-white">{customerProposal.openCount || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
              <span className="material-symbols-outlined text-2xl text-primary">mail</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">当前状态</p>
              <p className={`font-medium ${sendStatusConfig[customerProposal.sendStatus]?.color || 'text-slate-500'}`}>
                {sendStatusConfig[customerProposal.sendStatus]?.label || customerProposal.sendStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 邮件编辑 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">邮件编辑</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenContractModal}
              className="flex items-center gap-2 px-4 py-2 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              选择合同模板
            </button>
            <button
              onClick={handleGenerateEmail}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-purple-500 hover:text-purple-600 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              AI生成邮件
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                收件人 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={emailForm.emailTo}
                onChange={(e) => setEmailForm(prev => ({ ...prev, emailTo: e.target.value }))}
                placeholder="customer@example.com"
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                抄送
              </label>
              <input
                type="text"
                value={emailForm.emailCc.join(', ')}
                onChange={(e) => setEmailForm(prev => ({ 
                  ...prev, 
                  emailCc: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                placeholder="cc1@example.com, cc2@example.com"
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              邮件主题
            </label>
            <input
              type="text"
              value={emailForm.emailSubject}
              onChange={(e) => setEmailForm(prev => ({ ...prev, emailSubject: e.target.value }))}
              placeholder="商务方案 - [公司名称]"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              邮件内容
            </label>
            <textarea
              value={emailForm.emailBody}
              onChange={(e) => setEmailForm(prev => ({ ...prev, emailBody: e.target.value }))}
              rows={12}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg resize-none font-mono text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleSaveEmail}
              disabled={loading}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            >
              保存草稿
            </button>
            <button
              onClick={handleSendEmail}
              disabled={loading || !emailForm.emailTo}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {loading ? '发送中...' : '发送邮件'}
            </button>
          </div>
        </div>
      </div>

      {/* 方案摘要 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">方案摘要</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">方案标题</span>
            <span className="text-slate-900 dark:text-white">{proposal.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">方案金额</span>
            <span className="font-medium text-primary">¥{proposal.value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">客户</span>
            <span className="text-slate-900 dark:text-white">{proposal.customer?.name}</span>
          </div>
        </div>
      </div>

      {/* 合同模板选择模态框 */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowContractModal(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col m-4">
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">选择合同模板</h3>
              <button
                onClick={() => setShowContractModal(false)}
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
                  value={contractSearch}
                  onChange={(e) => {
                    setContractSearch(e.target.value);
                    loadContractTemplates(e.target.value);
                  }}
                  placeholder="搜索模板名称或类别..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </div>
            
            {/* 模板列表和预览 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 左侧模板列表 */}
              <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 overflow-y-auto p-4">
                {contractLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : contractTemplates.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <span className="material-symbols-outlined text-4xl mb-2">description</span>
                    <p>知识库中暂无合同模板</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contractTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedContract(template)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedContract?.id === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">{template.name}</div>
                            <div className="text-xs text-slate-400 mt-1">{template.category}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewContract(template);
                            }}
                            className="text-primary text-sm hover:underline"
                          >
                            预览
                          </button>
                        </div>
                        {template.description && (
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                            {template.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                          <span>使用次数: {template.usageCount || 0}</span>
                          {template.variables && template.variables.length > 0 && (
                            <span>• 变量: {template.variables.length}个</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 右侧预览区域 */}
              <div className="w-1/2 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
                {previewContract ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-900 dark:text-white">模板预览</h4>
                      <button
                        onClick={() => setPreviewContract(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                      <h5 className="font-medium text-slate-900 dark:text-white mb-2">{previewContract.name}</h5>
                      <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {fillTemplateVariables(previewContract.content)}
                      </div>
                    </div>
                    {previewContract.variables && previewContract.variables.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">模板变量</h5>
                        <div className="flex flex-wrap gap-2">
                          {previewContract.variables.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded text-xs">
                              {v.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedContract ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">visibility</span>
                    <p className="text-slate-400">点击"预览"查看模板内容</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">description</span>
                    <p className="text-slate-400">选择模板查看详情</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 底部操作栏 */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {selectedContract ? `已选择: ${selectedContract.name}` : '请选择合同模板'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  取消
                </button>
                <button
                  onClick={handleApplyContract}
                  disabled={!selectedContract}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90"
                >
                  应用模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}