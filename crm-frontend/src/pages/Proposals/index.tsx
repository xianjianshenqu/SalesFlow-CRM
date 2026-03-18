import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proposalApi } from '../../services/api';
import type { ProposalStatus } from '../../services/api';
import type { Proposal } from '../../services/api';
import { getCustomerColor } from '../../data/customers';

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

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

// 状态标签
function StatusBadge({ status }: { status: ProposalStatus }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// 流程步骤卡片
function ProcessSteps() {
  const steps = [
    { num: 1, title: '需求分析', desc: '收集客户需求', icon: 'assignment' },
    { num: 2, title: '方案设计', desc: '制定解决方案', icon: 'design_services' },
    { num: 3, title: '内部评审', desc: '方案审核确认', icon: 'rate_review' },
    { num: 4, title: '客户提案', desc: '发送客户审阅', icon: 'send' },
    { num: 5, title: '商务谈判', desc: '条款协商确认', icon: 'handshake' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">商务方案流程</h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`size-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary`}>
                <span className="material-symbols-outlined">{step.icon}</span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mt-2">{step.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="w-12 h-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 方案卡片
function ProposalCard({ proposal }: { proposal: Proposal }) {
  const navigate = useNavigate();
  const shortName = proposal.customer?.shortName || proposal.customer?.name?.substring(0, 2).toUpperCase() || 'UN';
  const colorClass = getCustomerColor(shortName);
  
  return (
    <div 
      onClick={() => navigate(`/proposals/${proposal.id}`)}
      className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`size-12 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold`}>
          {shortName}
        </div>
        <StatusBadge status={proposal.status} />
      </div>
      
      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">{proposal.title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{proposal.description || '暂无描述'}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">方案价值</p>
          <p className="font-semibold text-primary">{formatCurrency(proposal.value)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">客户</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{proposal.customer?.name || '未知客户'}</p>
        </div>
      </div>
    </div>
  );
}

// 状态筛选标签
const filterStatuses: { value: 'all' | ProposalStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'requirement_analysis', label: '需求分析' },
  { value: 'designing', label: '方案设计' },
  { value: 'pending_review', label: '待评审' },
  { value: 'customer_proposal', label: '客户提案' },
  { value: 'negotiation', label: '商务谈判' },
  { value: 'accepted', label: '已接受' },
];

export default function Proposals() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | ProposalStatus>('all');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 获取方案列表
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (filterStatus !== 'all') {
          params.status = filterStatus;
        }
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const response = await proposalApi.getAll(params);
        setProposals(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('获取方案列表失败:', err);
        setError('加载失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposals();
  }, [filterStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">商务方案</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理和追踪商务提案全流程</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/proposals/create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            新建方案
          </button>
        </div>
      </div>

      {/* 流程步骤 */}
      <ProcessSteps />

      {/* 筛选和搜索 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {filterStatuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status.value
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="搜索方案..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* 方案列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2">description</span>
          <p>暂无方案数据</p>
          <button 
            onClick={() => navigate('/proposals/create')}
            className="mt-4 text-primary hover:underline"
          >
            创建第一个方案
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      )}
    </div>
  );
}