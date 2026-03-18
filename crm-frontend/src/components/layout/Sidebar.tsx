import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

// 导航菜单配置
const navItems = [
  { path: '/', icon: 'dashboard', label: '工作台' },
  { path: '/customers', icon: 'group', label: '客户管理' },
  { path: '/funnel', icon: 'filter_alt', label: '销售漏斗' },
  { path: '/proposals', icon: 'description', label: '商务方案' },
  { path: '/service', icon: 'support_agent', label: '售后服务' },
  { path: '/payments', icon: 'payments', label: '回款统计' },
  { path: '/ai-audio', icon: 'settings_voice', label: 'AI 录音分析' },
  { path: '/ai-assistant', icon: 'auto_awesome', label: 'AI 助手' },
  { path: '/schedule', icon: 'calendar_today', label: '智能日程' },
  { path: '/map', icon: 'map', label: '客户地图' },
  { path: '/team', icon: 'groups', label: '团队协作' },
  { path: '/presales', icon: 'storefront', label: '售前中心' },
];

export function Sidebar() {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="w-72 h-screen flex flex-col shrink-0 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0a0f1a]"></div>
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='1'%3E%3Cpath d='M36 34h-2v-4h2v4zm0-6h-2v-4h2v4zm0-6h-2v-4h2v4zm0-6h-2V8h2v8zm0 28h-2v-4h2v4zm0 6h-2v-4h2v4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo区域 */}
        <div className="p-6 flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl blur-lg opacity-50"></div>
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="material-symbols-outlined text-[#0a0f1a] text-2xl">trending_up</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-['Outfit']">
              <span className="gradient-text">Sales</span>
              <span className="text-white">Flow</span>
            </h1>
            <p className="text-xs text-gray-300 font-medium tracking-wider uppercase">AI CRM Enterprise</p>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
                           (item.path !== '/' && location.pathname.startsWith(item.path));
            const isHovered = hoveredItem === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-amber-300'
                    : 'text-gray-300 hover:text-white'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Active background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl"></div>
                )}
                
                {/* Hover glow effect */}
                {isHovered && !isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-transparent rounded-xl"></div>
                )}
                
                {/* Left border indicator */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 opacity-100' 
                    : 'bg-amber-400 opacity-0 group-hover:opacity-50'
                }`}></div>
                
                {/* Icon */}
                <span className={`material-symbols-outlined relative z-10 transition-all duration-300 ${
                  isActive ? 'text-amber-300' : ''
                }`} style={{ fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400" }}>
                  {item.icon}
                </span>
                
                {/* Label */}
                <span className={`relative z-10 text-sm font-medium transition-all duration-300 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
                
                {/* Active dot */}
                {isActive && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* 底部区域 */}
        <div className="p-4 mt-auto">
          {/* Quick Action Button */}
          <button className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]">
            {/* Button background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>
            
            <span className="material-symbols-outlined relative z-10 text-[#0a0f1a] text-lg">add</span>
            <span className="relative z-10 text-[#0a0f1a] text-sm font-semibold">新建商机</span>
          </button>
        </div>

        {/* 用户信息 */}
        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-800/30 transition-colors cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden ring-2 ring-gray-700 group-hover:ring-amber-500/50 transition-all">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111827]"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Alex Chen</p>
              <p className="text-xs text-gray-300 truncate">Sales Manager</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
          </div>
        </div>
      </div>
    </aside>
  );
}