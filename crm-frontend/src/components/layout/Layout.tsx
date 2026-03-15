import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  title?: string;
}

export function Layout({ title = '工作台' }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* 左侧侧边栏 */}
      <Sidebar />
      
      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}