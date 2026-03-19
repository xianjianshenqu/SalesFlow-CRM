import { useState, useEffect } from 'react';
import type { Proposal } from '../../../../services/api';
import type { CustomerProposalRecord } from '../../../../services/api';
import { proposalApi } from '../../../../services/api';

interface CustomerProposalStageProps {
  proposalId: string;
  proposal: Proposal;
  onComplete: () => void;
}

export default function CustomerProposalStage({ proposalId, proposal, onComplete }: CustomerProposalStageProps) {
  const [loading, setLoading] = useState(false);
  const [customerProposal, setCustomerProposal] = useState<CustomerProposalRecord | null>(null);
  
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
          <button
            onClick={handleGenerateEmail}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-purple-500 hover:text-purple-600 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            AI生成邮件
          </button>
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
    </div>
  );
}