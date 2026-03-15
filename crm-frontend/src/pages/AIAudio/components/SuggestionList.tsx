import { useState } from 'react';
import type { AISuggestion } from '../../../types';

interface SuggestionListProps {
  suggestions: AISuggestion[];
  onAddToSchedule: (suggestion: AISuggestion) => void;
}

const suggestionTypeConfig: Record<string, { icon: string; label: string; color: string }> = {
  email: { icon: 'mail', label: '邮件', color: 'text-blue-500' },
  demo: { icon: 'play_circle', label: '演示', color: 'text-purple-500' },
  proposal: { icon: 'description', label: '方案', color: 'text-emerald-500' },
  follow_up: { icon: 'phone_in_talk', label: '跟进', color: 'text-amber-500' },
  price: { icon: 'payments', label: '报价', color: 'text-rose-500' },
};

const priorityConfig: Record<string, { label: string; bg: string; text: string }> = {
  high: { label: '高', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  medium: { label: '中', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  low: { label: '低', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
};

export function SuggestionList({ suggestions, onAddToSchedule }: SuggestionListProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToSchedule = async (suggestion: AISuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsAdding(true);
    try {
      await onAddToSchedule(suggestion);
    } finally {
      setIsAdding(false);
      setSelectedSuggestion(null);
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">lightbulb</span>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">暂无智能建议</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">完成AI分析后将自动生成建议</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* 头部 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          <h4 className="font-semibold text-slate-900 dark:text-white">智能建议</h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          基于AI分析生成的可操作建议，可一键添加到日程
        </p>
      </div>

      {/* 建议列表 */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {suggestions.map((suggestion, index) => {
          const typeInfo = suggestionTypeConfig[suggestion.type] || suggestionTypeConfig.follow_up;
          const priorityInfo = priorityConfig[suggestion.priority] || priorityConfig.medium;
          const isSelected = selectedSuggestion?.title === suggestion.title;

          return (
            <div 
              key={index}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* 类型图标 */}
                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined ${typeInfo.color}`}>{typeInfo.icon}</span>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${priorityInfo.bg} ${priorityInfo.text}`}>
                      {priorityInfo.label}优先级
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {typeInfo.label}
                    </span>
                  </div>
                  <h5 className="font-medium text-slate-900 dark:text-white text-sm">
                    {suggestion.title}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>

                {/* 操作按钮 */}
                <button
                  onClick={() => handleAddToSchedule(suggestion)}
                  disabled={isAdding && isSelected}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary dark:bg-primary/20 rounded-lg text-xs font-medium hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors disabled:opacity-50 shrink-0"
                >
                  {isAdding && isSelected ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      添加中
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">add_task</span>
                      添加到日程
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          点击"添加到日程"将自动创建对应的跟进任务
        </p>
      </div>
    </div>
  );
}