import { useState } from 'react';
import { getCustomerColor } from '../../data/customers';

// 商务方案Mock数据
const mockProposals = [
  {
    id: 'p1',
    title: '华为数字化转型解决方案',
    customerName: '华为技术有限公司',
    customerShortName: 'HW',
    value: 1250000,
    status: 'sent' as const,
    createdAt: '2023-10-10',
    owner: 'Alex Chen',
    description: '全面数字化转型解决方案，包含云计算、AI分析、数据治理等模块'
  },
  {
    id: 'p2',
    title: '阿里巴巴智能客服升级方案',
    customerName: '阿里巴巴集团',
    customerShortName: 'AL',
    value: 850000,
    status: 'pending_review' as const,
    createdAt: '2023-10-12',
    owner: 'Alex Chen',
    description: '智能客服系统升级，集成AI对话和情感分析功能'
  },
  {
    id: 'p3',
    title: '宁德时代MES系统实施方案',
    customerName: '宁德时代新能源科技股份有限公司',
    customerShortName: 'ND',
    value: 680000,
    status: 'draft' as const,
    createdAt: '2023-10-14',
    owner: 'Sarah Wang',
    description: '制造执行系统(MES)全面实施方案'
  },
  {
    id: 'p4',
    title: '比亚迪供应链优化方案',
    customerName: '比亚迪股份有限公司',
    customerShortName: 'BYD',
    value: 420000,
    status: 'accepted' as const,
    createdAt: '2023-10-08',
    owner: 'Mike Liu',
    description: '供应链管理系统优化方案'
  },
  {
    id: 'p5',
    title: '百度AI训练平台方案',
    customerName: '百度在线网络技术（北京）有限公司',
    customerShortName: 'BD',
    value: 550000,
    status: 'sent' as const,
    createdAt: '2023-10-11',
    owner: 'Sarah Wang',
    description: 'AI模型训练和部署平台解决方案'
  }
];

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 状态标签
function StatusBadge({ status }: { status: typeof mockProposals[0]['status'] }) {
  const config = {
    draft: { label: '草稿', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
    pending_review: { label: '待审核', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    sent: { label: '已发送', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    accepted: { label: '已接受', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    rejected: { label: '已拒绝', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }
  };
  const { label, bg, text } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
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
              <div className={`size-12 rounded-xl flex items-center justify-center ${
                index < 3 ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
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
function ProposalCard({ proposal }: { proposal: typeof mockProposals[0] }) {
  const colorClass = getCustomerColor(proposal.customerShortName);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className={`size-12 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold`}>
          {proposal.customerShortName}
        </div>
        <StatusBadge status={proposal.status} />
      </div>
      
      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">{proposal.title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{proposal.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">方案价值</p>
          <p className="font-semibold text-primary">{formatCurrency(proposal.value)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">负责人</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{proposal.owner}</p>
        </div>
      </div>
    </div>
  );
}

export default function Proposals() {
  const [filterStatus, setFilterStatus] = useState<'all' | typeof mockProposals[0]['status']>('all');
  
  const filteredProposals = filterStatus === 'all' 
    ? mockProposals 
    : mockProposals.filter(p => p.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">商务方案</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理和追踪商务提案全流程</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            AI 生成方案
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            新建方案
          </button>
        </div>
      </div>

      {/* 流程步骤 */}
      <ProcessSteps />

      {/* 筛选标签 */}
      <div className="flex items-center gap-2">
        {['all', 'draft', 'pending_review', 'sent', 'accepted'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as typeof filterStatus)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? '全部' : 
             status === 'draft' ? '草稿' :
             status === 'pending_review' ? '待审核' :
             status === 'sent' ? '已发送' : '已接受'}
          </button>
        ))}
      </div>

      {/* 方案卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}