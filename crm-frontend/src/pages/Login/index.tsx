import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('admin@crm.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 如果已登录，重定向到目标页面或首页
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#111827] to-[#0f172a]"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]"></div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(251, 191, 36, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 191, 36, 0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      ></div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo 和标题 */}
        <div className="text-center mb-10 fade-in-up">
          <div className="relative inline-block mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl blur-2xl opacity-50"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <span className="material-symbols-outlined text-4xl text-[#0a0f1a]">trending_up</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white font-['Outfit'] mb-2">
            <span className="gradient-text">Sales</span>Flow
          </h1>
          <p className="text-gray-300">智能销售管理系统</p>
        </div>

        {/* 登录表单 */}
        <div className="relative rounded-2xl overflow-hidden fade-in-up stagger-1">
          {/* Glass background */}
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-2xl border border-gray-700/30 rounded-2xl"></div>
          
          {/* Subtle gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/10 via-transparent to-transparent opacity-50"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center border border-amber-500/20">
                <span className="material-symbols-outlined text-amber-400 text-sm">login</span>
              </div>
              <h2 className="text-xl font-semibold text-white font-['Outfit']">登录账户</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 错误提示 */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">邮箱地址</label>
                <div className="relative group">
                  <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-amber-400' : 'text-gray-500'}`}>mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 focus:bg-gray-800/80 transition-all"
                    placeholder="请输入邮箱"
                    required
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">密码</label>
                <div className="relative group">
                  <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-amber-400' : 'text-gray-500'}`}>lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 focus:bg-gray-800/80 transition-all"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* 记住我 & 忘记密码 */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                  <div className="relative w-4 h-4">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-4 h-4 rounded border border-gray-600 bg-gray-800/50 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all"></div>
                    <span className="material-symbols-outlined absolute inset-0 text-[10px] text-gray-900 opacity-0 peer-checked:opacity-100 flex items-center justify-center">check</span>
                  </div>
                  <span className="group-hover:text-gray-300 transition-colors">记住我</span>
                </label>
                <a href="#" className="text-amber-400 hover:text-amber-300 transition-colors">忘记密码？</a>
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-3.5 rounded-xl font-semibold text-gray-900 overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Button background */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </div>
                
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
                      <span>登录中...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">login</span>
                      <span>登录</span>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* 分隔线 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-500 text-xs">或使用以下方式登录</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex items-center justify-center gap-3">
              <button className="w-10 h-10 rounded-xl bg-gray-800/50 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-xl bg-gray-800/50 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </button>
              <button className="w-10 h-10 rounded-xl bg-gray-800/50 border border-gray-700/30 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 hover:border-gray-600/50 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </button>
            </div>

            {/* 测试账号提示 */}
            <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-300 text-sm">info</span>
                <span className="text-sm font-medium text-amber-300">测试账号</span>
              </div>
              <div className="text-gray-300 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">邮箱:</span>
                  <span className="text-gray-200 font-mono">admin@crm.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">密码:</span>
                  <span className="text-gray-200 font-mono">admin123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <p className="text-center text-gray-400 text-sm mt-8">
          © 2024 <span className="text-gray-300">SalesFlow</span> CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}