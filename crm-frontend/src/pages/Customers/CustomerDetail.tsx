/**
 * 客户详情页面
 * 展示客户信息、客户画像、流失预警等AI功能
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChurnAlertCard, CustomerInsightPanel } from '../../components/AI';
import { getCustomerColor } from '../../data/customers';
import type { Customer, Opportunity } from '../../types';

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
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 阶段颜色映射
const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  new_lead: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
  contacted: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  solution: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  negotiation: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  won: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' }
};

// 阶段标签
const STAGE_LABELS: Record<string, string> = {
  new_lead: '新线索',
  contacted: '已联系',
  solution: '方案建议',
  negotiation: '谈判中',
  won: '已成交'
};

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'churn' | 'activities'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取客户数据
    const fetchCustomer = async () => {
      setLoading(true);
      // 这里应该调用真实的API
      // 模拟数据
      setTimeout(() => {
        setCustomer({
          id: id || '1',
          name: '华为技术有限公司',
          shortName: 'HW',
          email: 'contact@huawei.com',
          stage: 'negotiation',
          estimatedValue: 500000,
          nextFollowUp: '2023-10-20',
          source: 'conference',
          priority: 'high',
          contactPerson: '张经理',
          phone: '13800138000',
          address: '深圳市龙岗区坂田华为基地',
          city: '深圳',
          industry: '信息技术',
          createdAt: '2023-01-15',
          updatedAt: '2023-10-16'
        });
        setOpportunities([
          {
            id: '1',
            customerId: id || '1',
            customerName: '华为技术有限公司',
            title: '数字化转型项目',
            stage: 'negotiation',
            value: 500000,
            probability: 75,
            owner: 'Alex',
            priority: 'high',
            expectedCloseDate: '2023-11-30',
            lastActivity: '2023-10-15',
            description: '企业数字化转型解决方案'
          }
        ]);
        setLoading(false);
      }, 500);
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-slate-300">error</span>
        <p className="text-slate-500 mt-2">客户不存在</p>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          返回列表
        </button>
      </div>
    );
  }

  const colorClass = getCustomerColor(customer.shortName);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          </button>
          <div className={`size-16 rounded-xl ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-bold text-xl`}>
            {customer.shortName}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[customer.stage]?.bg} ${STAGE_COLORS[customer.stage]?.text}`}>
                {STAGE_LABELS[customer.stage] || customer.stage}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{customer.industry}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">
            <span className="material-symbols-outlined text-sm">edit</span>
            编辑
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-sm">add</span>
            新建商机
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">预估价值</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(customer.estimatedValue)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">活跃商机</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {opportunities.length} 个
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">下次跟进</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatDate(customer.nextFollowUp)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">创建时间</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex">
            {[
              { key: 'overview', label: '概览', icon: 'dashboard' },
              { key: 'insights', label: '客户画像', icon: 'psychology' },
              { key: 'churn', label: '流失预警', icon: 'warning' },
              { key: 'activities', label: '活动记录', icon: 'history' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 概览Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">基本信息</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">联系人</span>
                    <span className="text-slate-900 dark:text-white">{customer.contactPerson}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">电话</span>
                    <span className="text-slate-900 dark:text-white">{customer.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">邮箱</span>
                    <span className="text-slate-900 dark:text-white">{customer.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">地址</span>
                    <span className="text-slate-900 dark:text-white">{customer.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">来源</span>
                    <span className="text-slate-900 dark:text-white capitalize">{customer.source}</span>
                  </div>
                </div>
              </div>

              {/* 关联商机 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">关联商机</h3>
                {opportunities.length > 0 ? (
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900 dark:text-white">{opp.title}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STAGE_COLORS[opp.stage]?.bg} ${STAGE_COLORS[opp.stage]?.text}`}>
                            {STAGE_LABELS[opp.stage]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">{formatCurrency(opp.value)}</span>
                          <span className="text-primary font-medium">{opp.probability}% 成交概率</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    暂无关联商机
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 客户画像Tab */}
          {activeTab === 'insights' && id && (
            <CustomerInsightPanel customerId={id} />
          )}

          {/* 流失预警Tab */}
          {activeTab === 'churn' && id && (
            <ChurnAlertCard customerId={id} />
          )}

          {/* 活动记录Tab */}
          {activeTab === 'activities' && (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl">history</span>
              <p className="mt-2">活动记录功能开发中</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}