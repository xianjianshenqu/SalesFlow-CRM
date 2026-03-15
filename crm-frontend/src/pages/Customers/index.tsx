import { useState } from 'react';
import { mockCustomers, filterCustomersByStage, getCustomerColor } from '../../data/customers';
import { STAGE_LABELS, STAGE_COLORS, type Stage, type Customer } from '../../types';

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 格式化日期
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
}

// 阶段标签组件
function StageBadge({ stage }: { stage: Stage }) {
  const colors = STAGE_COLORS[stage];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

// 优先级标签
function PriorityBadge({ priority }: { priority: Customer['priority'] }) {
  const config = {
    high: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: '高' },
    medium: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: '中' },
    low: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', label: '低' }
  };
  const { color, label } = config[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

// 客户头像组件
function CustomerAvatar({ name, shortName }: { name: string; shortName: string }) {
  const colorClass = getCustomerColor(shortName);
  return (
    <div className={`size-10 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold text-sm shrink-0`}>
      {shortName}
    </div>
  );
}

export default function Customers() {
  const [activeTab, setActiveTab] = useState<Stage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 筛选客户
  const filteredCustomers = filterCustomersByStage(mockCustomers, activeTab)
    .filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.shortName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // 分页
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Tab配置
  const tabs: { key: Stage | 'all'; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: mockCustomers.length },
    { key: 'new_lead', label: '新线索', count: mockCustomers.filter(c => c.stage === 'new_lead').length },
    { key: 'contacted', label: '已联系', count: mockCustomers.filter(c => c.stage === 'contacted').length },
    { key: 'solution', label: '方案建议', count: mockCustomers.filter(c => c.stage === 'solution').length },
    { key: 'negotiation', label: '谈判中', count: mockCustomers.filter(c => c.stage === 'negotiation').length },
    { key: 'won', label: '已成交', count: mockCustomers.filter(c => c.stage === 'won').length },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">客户管理</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">管理您的所有客户信息和跟进状态</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          添加客户
        </button>
      </div>

      {/* Tab导航 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* 搜索和筛选 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
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
                placeholder="搜索客户名称、联系人..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              筛选
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              导出
            </button>
          </div>
        </div>

        {/* 客户表格 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  客户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  阶段
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  预估价值
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  优先级
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  下次跟进
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  来源
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar name={customer.name} shortName={customer.shortName} />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{customer.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {customer.contactPerson} · {customer.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StageBadge stage={customer.stage} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(customer.estimatedValue)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityBadge priority={customer.priority} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(customer.nextFollowUp)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {customer.source === 'direct' ? '直销' : 
                       customer.source === 'referral' ? '推荐' :
                       customer.source === 'website' ? '网站' :
                       customer.source === 'conference' ? '会议' : '合作伙伴'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} 条，共 {filteredCustomers.length} 条
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              上一页
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}