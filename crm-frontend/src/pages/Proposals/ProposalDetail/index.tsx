import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proposalApi } from '../../../services/api';
import type { Proposal } from '../../../services/api';
import type { ProposalStatus } from '../../../services/api';
import StageProgress from './components/StageProgress';
import RequirementAnalysis from './components/RequirementAnalysis';
import ProposalDesign from './components/ProposalDesign';
import InternalReview from './components/InternalReview';
import CustomerProposalStage from './components/CustomerProposalStage';
import NegotiationStage from './components/NegotiationStage';

// 状态配置
const statusConfig: Record<ProposalStatus, { label: string; bg: string; text: string }> = {
  draft: { label: '草稿', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
  requirement_analysis: { label: '需求分析中', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  designing: { label: '方案设计中', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  pending_review: { label: '待内部评审', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  review_passed: { label: '评审通过', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
  review_rejected: { label: '评审驳回', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  customer_proposal: { label: '客户提案中', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
  negotiation: { label: '商务谈判中', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  sent: { label: '已发送', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  accepted: { label: '已接受', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  rejected: { label: '已拒绝', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  expired: { label: '已过期', bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-600 dark:text-gray-400' },
};

function StatusBadge({ status }: { status: ProposalStatus }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // 加载方案详情
  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await proposalApi.getById(id);
        setProposal(response.data);
      } catch (err) {
        console.error('加载方案失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
  }, [id, refreshKey]);

  // 刷新方案数据
  const refreshProposal = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        方案不存在或已被删除
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/proposals')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            返回列表
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{proposal.title}</h1>
            <StatusBadge status={proposal.status} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            客户：{proposal.customer?.name || '未知客户'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">方案价值</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(proposal.value)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">创建时间</p>
          <p className="text-lg font-medium text-slate-900 dark:text-white">{new Date(proposal.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">有效期至</p>
          <p className="text-lg font-medium text-slate-900 dark:text-white">{proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : '未设置'}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">创建人</p>
          <p className="text-lg font-medium text-slate-900 dark:text-white">{proposal.createdBy?.name || '未知'}</p>
        </div>
      </div>

      {/* 阶段进度 */}
      <StageProgress currentStatus={proposal.status} />

      {/* 阶段1: 需求分析 - 方案创建后默认进入此阶段 */}
      {proposal.status === 'requirement_analysis' && (
        <RequirementAnalysis 
          proposalId={proposal.id} 
          customerId={proposal.customerId}
          onComplete={refreshProposal}
        />
      )}

      {/* 阶段2: 方案设计 */}
      {proposal.status === 'designing' && (
        <ProposalDesign 
          proposalId={proposal.id}
          proposal={proposal}
          onComplete={refreshProposal}
        />
      )}

      {/* 阶段3: 内部评审 */}
      {['pending_review', 'review_passed', 'review_rejected'].includes(proposal.status) && (
        <InternalReview 
          proposalId={proposal.id}
          proposal={proposal}
          onComplete={refreshProposal}
        />
      )}

      {/* 阶段4: 客户提案 */}
      {proposal.status === 'customer_proposal' && (
        <CustomerProposalStage 
          proposalId={proposal.id}
          proposal={proposal}
          onComplete={refreshProposal}
        />
      )}

      {/* 阶段5: 商务谈判 */}
      {proposal.status === 'negotiation' && (
        <NegotiationStage 
          proposalId={proposal.id}
          proposal={proposal}
          onComplete={refreshProposal}
        />
      )}

      {/* 已发送状态 - 可进入商务谈判 */}
      {proposal.status === 'sent' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-blue-500">mail</span>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">方案已发送</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-4">等待客户回复，可随时开始商务谈判</p>
            <button
              onClick={async () => {
                try {
                  await proposalApi.createNegotiation(proposal.id);
                  refreshProposal();
                } catch (err) {
                  console.error('进入商务谈判失败:', err);
                  alert('操作失败');
                }
              }}
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              进入商务谈判
            </button>
          </div>
        </div>
      )}

      {/* 终态显示 */}
      {['accepted', 'rejected', 'expired'].includes(proposal.status) && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <span className={`material-symbols-outlined text-6xl ${
            proposal.status === 'accepted' ? 'text-emerald-500' : 
            proposal.status === 'rejected' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {proposal.status === 'accepted' ? 'check_circle' : 
             proposal.status === 'rejected' ? 'cancel' : 'description'}
          </span>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-4">
            {proposal.status === 'accepted' ? '方案已接受！' : 
             proposal.status === 'rejected' ? '方案已拒绝' : 
             proposal.status === 'sent' ? '方案已发送' : '方案已过期'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {proposal.notes || '无备注信息'}
          </p>
        </div>
      )}
    </div>
  );
}