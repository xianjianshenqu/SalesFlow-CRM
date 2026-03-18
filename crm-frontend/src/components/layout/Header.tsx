import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  title?: string;
}

export function Header({ title: _title = '工作台' }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sample notifications
  const notifications = [
    { id: 1, title: '新客户跟进提醒', message: '华为技术有限公司需要今日跟进', time: '5分钟前', type: 'urgent' },
    { id: 2, title: '商机状态变更', message: '宁德时代项目进入合同阶段', time: '1小时前', type: 'success' },
    { id: 3, title: 'AI 分析报告', message: '今日录音分析已完成', time: '2小时前', type: 'info' },
  ];

  return (
    <header className="h-20 flex items-center justify-between px-8 shrink-0 relative z-20">
      {/* Background with glass effect */}
      <div className="absolute inset-0 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-gray-800/50"></div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* 搜索框 */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors">
              search
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 focus:bg-gray-900/80 transition-all"
              placeholder="搜索客户、商机或方案..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-800 rounded border border-gray-700">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-3">
          {/* 升级按钮 */}
          <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-medium hover:from-amber-500/20 hover:to-amber-600/20 hover:border-amber-500/30 transition-all group">
            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">rocket_launch</span>
            <span>升级方案</span>
          </button>

          {/* 通知按钮 */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-gray-400 hover:text-gray-200 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0f1a] animate-pulse"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">通知</h3>
                  <button className="text-xs text-amber-400 hover:text-amber-300">全部标记为已读</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-800/50 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notif.type === 'urgent' ? 'bg-red-500' : 
                          notif.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-200">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-600 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 设置按钮 */}
          <button className="p-2.5 text-gray-400 hover:text-gray-200 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all">
            <span className="material-symbols-outlined">settings</span>
          </button>

          {/* 分隔线 */}
          <div className="h-8 w-px bg-gray-800 mx-1"></div>

          {/* 用户头像 */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-800/30 transition-all group"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center font-semibold text-amber-400 ring-2 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0f1a]"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-200 leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{user?.role === 'admin' ? '管理员' : user?.role === 'manager' ? '经理' : '销售'}</p>
              </div>
              <span className="material-symbols-outlined text-gray-500 text-lg">expand_more</span>
            </button>
            
            {/* 用户下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-base">person</span>
                    个人资料
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-base">palette</span>
                    外观设置
                  </button>
                </div>
                <div className="border-t border-gray-800 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}