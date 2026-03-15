import { NavLink } from 'react-router-dom';

// 导航菜单配置
const navItems = [
  { path: '/', icon: 'dashboard', label: '工作台' },
  { path: '/customers', icon: 'group', label: '客户管理' },
  { path: '/funnel', icon: 'filter_alt', label: '销售漏斗' },
  { path: '/proposals', icon: 'description', label: '商务方案' },
  { path: '/service', icon: 'support_agent', label: '售后服务' },
  { path: '/payments', icon: 'payments', label: '回款统计' },
  { path: '/ai-audio', icon: 'settings_voice', label: 'AI 录音分析' },
  { path: '/schedule', icon: 'calendar_today', label: '智能日程' },
  { path: '/map', icon: 'map', label: '客户地图' },
  { path: '/team', icon: 'groups', label: '团队协作' },
  { path: '/presales', icon: 'storefront', label: '售前中心' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      {/* Logo区域 */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">trending_up</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">SalesFlow</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">AI CRM Enterprise</p>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 底部区域 */}
      <div className="p-4 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          <span>New Lead</span>
        </button>
      </div>

      {/* 用户信息 */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7V0G3LOBXMmra5NcyxKWwA2mjirmBLHljZahivlXMtB5KNOEC67SfxwT1UeKdVkylAW-UPF2CDVWCGlykjFu35B1VIsBaAgZ0Zeq7QNrC2M6Y06NDWYBwKKZQCkF4e0GvzuB6Tc6h6Gg2Gj4NUE6adMnSkD7ZBAvZztq_hwRwtji0lgSpiUj3JPSPcJIu87orKlQaKBG7Cf3SnsLbwXwyZNJu3XF5a9gwtzl9rTgi7PAZJ0XRzExYWnqzQY4QkI_nFGkOE_8ae-Y"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Alex Chen</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Sales Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}