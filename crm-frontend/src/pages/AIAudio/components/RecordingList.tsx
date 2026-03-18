import type { AudioRecording, Sentiment } from '../../../types';
import { getCustomerColor } from '../../../data/customers';

interface RecordingListProps {
  recordings: AudioRecording[];
  selectedId?: string;
  onSelect: (recording: AudioRecording) => void;
  isLoading?: boolean;
}

// 情感图标
const sentimentIcon: Record<Sentiment, { icon: string; color: string }> = {
  positive: { icon: 'sentiment_satisfied', color: 'text-emerald-500' },
  neutral: { icon: 'sentiment_neutral', color: 'text-slate-400' },
  negative: { icon: 'sentiment_dissatisfied', color: 'text-red-500' },
};

// 格式化时长
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export function RecordingList({ recordings, selectedId, onSelect, isLoading }: RecordingListProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">mic_off</span>
          <p className="text-slate-500 dark:text-slate-400 mt-3">暂无录音记录</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            上传录音或同步钉钉录音后将在此显示
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* 列表 */}
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
        {recordings.map((recording) => {
          const isSelected = selectedId === recording.id;
          const colorClass = getCustomerColor(recording.customerShortName || 'XX');
          const sentiment = recording.sentiment || 'neutral';
          const iconInfo = sentimentIcon[sentiment];

          return (
            <div
              key={recording.id}
              onClick={() => onSelect(recording)}
              className={`p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-primary/5 dark:bg-primary/10'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 客户头像 */}
                <div 
                  className={`size-10 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold text-sm shrink-0`}
                >
                  {recording.customerShortName || recording.customerName?.substring(0, 2) || '??'}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                      {recording.customerName || '未知客户'}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                      {formatDuration(recording.duration)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {recording.contactPerson || '未知联系人'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(recording.recordedAt || recording.createdAt)}
                    </span>
                    {recording.status === 'analyzed' && (
                      <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded">
                        已分析
                      </span>
                    )}
                    {recording.status === 'pending' && (
                      <span className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                        待分析
                      </span>
                    )}
                    {recording.status === 'processing' && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                        分析中
                      </span>
                    )}
                  </div>
                  {recording.summary && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                      {recording.summary}
                    </p>
                  )}
                </div>

                {/* 情感图标 */}
                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-sm ${iconInfo.color}`}>
                    {iconInfo.icon}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}