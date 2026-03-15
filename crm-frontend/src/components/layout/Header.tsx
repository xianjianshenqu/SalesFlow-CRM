import { useState } from 'react';

interface HeaderProps {
  title?: string;
}

export function Header({ title = '工作台' }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
      {/* 搜索框 */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-800 transition-all"
            placeholder="Search leads, deals, or customers..."
          />
        </div>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-4">
        {/* 升级按钮 */}
        <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined text-sm">rocket_launch</span>
          <span>Upgrade</span>
        </button>

        {/* 通知按钮 */}
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        {/* 分隔线 */}
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

        {/* 用户头像 */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">Alex Chen</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Sales Manager</p>
          </div>
          <div className="size-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7V0G3LOBXMmra5NcyxKWwA2mjirmBLHljZahivlXMtB5KNOEC67SfxwT1UeKdVkylAW-UPF2CDVWCGlykjFu35B1VIsBaAgZ0Zeq7QNrC2M6Y06NDWYBwKKZQCkF4e0GvzuB6Tc6h6Gg2Gj4NUE6adMnSkD7ZBAvZztq_hwRwtji0lgSpiUj3JPSPcJIu87orKlQaKBG7Cf3SnsLbwXwyZNJu3XF5a9gwtzl9rTgi7PAZJ0XRzExYWnqzQY4QkI_nFGkOE_8ae-Y"
            />
          </div>
        </div>
      </div>
    </header>
  );
}