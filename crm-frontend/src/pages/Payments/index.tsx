import { mockPayments, getPaymentStats, getOverduePayments, getPendingPayments, getPaymentForecast } from '../../data/payments';
import { PAYMENT_STATUS_COLORS, type Payment } from '../../types';

// 格式化金额
function formatCurrency(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(0)}万`;
  }
  return `¥${value.toLocaleString()}`;
}

// 状态标签组件
function StatusBadge({ status }: { status: Payment['status'] }) {
  const labels = {
    paid: '已付款',
    partial: '部分付款',
    pending: '待付款',
    overdue: '已逾期'
  };
  const colors = PAYMENT_STATUS_COLORS[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {labels[status]}
    </span>
  );
}

// 统计卡片组件
function StatsCard({ 
  title, 
  value, 
  subtitle,
  icon, 
  iconBgColor,
  trend
}: { 
  title: string; 
  value: string;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  trend?: { value: string; type: 'up' | 'down' };
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${trend.type === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              <span className="material-symbols-outlined text-sm">
                {trend.type === 'up' ? 'trending_up' : 'trending_down'}
              </span>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`size-12 rounded-xl ${iconBgColor} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-white">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// 收款预测柱状图
function PaymentForecastChart() {
  const forecast = getPaymentForecast();
  const maxValue = Math.max(...forecast.map(f => Math.max(f.expected, f.actual)));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-6">收款预测</h3>
      
      <div className="flex items-end gap-4 h-48">
        {forecast.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-end gap-1 h-32 w-full justify-center">
              {/* 预期柱 */}
              <div className="relative group">
                <div 
                  className="w-6 bg-slate-200 dark:bg-slate-700 rounded-t transition-all hover:bg-slate-300 dark:hover:bg-slate-600"
                  style={{ height: `${(item.expected / maxValue) * 100}%`, minHeight: item.expected > 0 ? '4px' : '0' }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  预期: {formatCurrency(item.expected)}
                </div>
              </div>
              {/* 实际柱 */}
              <div className="relative group">
                <div 
                  className="w-6 bg-primary rounded-t transition-all hover:bg-primary/80"
                  style={{ height: `${(item.actual / maxValue) * 100}%`, minHeight: item.actual > 0 ? '4px' : '0' }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  实际: {formatCurrency(item.actual)}
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.month}</span>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <span className="text-xs text-slate-500 dark:text-slate-400">预期收款</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded"></div>
          <span className="text-xs text-slate-500 dark:text-slate-400">实际收款</span>
        </div>
      </div>
    </div>
  );
}

// 催款提醒列表
function ReminderList() {
  const overduePayments = getOverduePayments();
  const pendingPayments = getPendingPayments();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">催款提醒</h3>
        <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
          {overduePayments.length} 笔逾期
        </span>
      </div>

      <div className="space-y-4">
        {/* 逾期款项 */}
        {overduePayments.map((payment) => (
          <div 
            key={payment.id}
            className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30"
          >
            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-red-500">warning</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                {payment.customerName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                发票 {payment.invoiceId} · 到期日 {payment.dueDate}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-red-600">{formatCurrency(payment.balance)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">逾期</p>
            </div>
            <button className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors shrink-0">
              催款
            </button>
          </div>
        ))}

        {/* 待付款项 */}
        {pendingPayments.filter(p => p.status !== 'overdue').slice(0, 3).map((payment) => (
          <div 
            key={payment.id}
            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
          >
            <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-500">schedule</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                {payment.customerName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                发票 {payment.invoiceId} · 到期日 {payment.dueDate}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(payment.balance)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">待收款</p>
            </div>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shrink-0">
              提醒
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 付款状态表格
function PaymentTable() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">客户付款状态</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                客户
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                发票编号
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                金额
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                已付款
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                到期日
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {mockPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{payment.customerName}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{payment.invoiceId}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{payment.planType}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900 dark:text-white text-sm">
                    {formatCurrency(payment.totalAmount)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(payment.paidAmount / payment.totalAmount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      {Math.round((payment.paidAmount / payment.totalAmount) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${payment.status === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                    {payment.dueDate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Payments() {
  const stats = getPaymentStats();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">回款统计</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">追踪客户付款状态，管理应收账款</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-sm">receipt_long</span>
          开具发票
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总收款"
          value={formatCurrency(stats.totalPaid)}
          subtitle={`${stats.totalCount} 笔交易`}
          icon="account_balance_wallet"
          iconBgColor="bg-emerald-500"
          trend={{ value: '+18.5% 较上月', type: 'up' }}
        />
        <StatsCard
          title="待收款"
          value={formatCurrency(stats.totalPending)}
          subtitle="未到期款项"
          icon="pending"
          iconBgColor="bg-blue-500"
        />
        <StatsCard
          title="已逾期"
          value={formatCurrency(stats.totalOverdue)}
          subtitle={`${getOverduePayments().length} 笔逾期`}
          icon="warning"
          iconBgColor="bg-red-500"
        />
        <StatsCard
          title="本月预测"
          value="¥625万"
          subtitle="预计到账"
          icon="trending_up"
          iconBgColor="bg-purple-500"
        />
      </div>

      {/* 收款预测图表 */}
      <PaymentForecastChart />

      {/* 催款提醒 */}
      <ReminderList />

      {/* 付款状态表格 */}
      <PaymentTable />
    </div>
  );
}