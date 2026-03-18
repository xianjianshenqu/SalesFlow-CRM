import { useState } from 'react';

interface DingTalkStatusCardProps {
  isConnected: boolean;
  totalRecordings: number;
  todayCount: number;
  weekCount: number;
  aiAccuracy: number;
  onSync: () => void;
  onSettings: () => void;
  isSyncing: boolean;
}

export function DingTalkStatusCard({
  isConnected,
  totalRecordings,
  todayCount,
  weekCount,
  aiAccuracy,
  onSync,
  onSettings: _onSettings,
  isSyncing,
}: DingTalkStatusCardProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white overflow-hidden relative">
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 size-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-1/4 size-20 bg-white/5 rounded-full translate-y-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">
                {isConnected ? 'link' : 'link_off'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">钉钉一通 连接状态</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`size-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-white/80 text-sm">
                  {isConnected ? '已连接 · 同步正常' : '未连接'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{totalRecordings.toLocaleString()}</p>
            <p className="text-white/60 text-xs">总录音数</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-white/60 text-xs">今日新增</p>
              <p className="font-semibold">{todayCount} 条</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">本周分析</p>
              <p className="font-semibold">{weekCount} 条</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">AI准确率</p>
              <p className="font-semibold">{aiAccuracy}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onSync}
              disabled={isSyncing || !isConnected}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  同步中...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">sync</span>
                  同步录音
                </>
              )}
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-xs text-white/60">同步频率</p>
                <p className="text-sm font-medium mt-1">每小时自动同步</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-xs text-white/60">最近同步</p>
                <p className="text-sm font-medium mt-1">
                  {new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}