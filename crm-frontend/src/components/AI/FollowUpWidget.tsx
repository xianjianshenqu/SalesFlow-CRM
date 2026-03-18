/**
 * 跟进建议小组件
 * 显示AI生成的跟进建议
 */

import { useState, useEffect } from 'react';

interface FollowUpSuggestion {
  id: string;
  customerId: string;
  type: 'call' | 'visit' | 'email' | 'wechat';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAt: string;
  expiresAt?: string;
  script?: string;
  status: string;
  customer: {
    id: string;
    name: string;
    company?: string;
    shortName?: string;
    industry?: string;
    phone?: string;
  };
}

interface FollowUpWidgetProps {
  limit?: number;
  onSuggestionClick?: (suggestion: FollowUpSuggestion) => void;
}

const typeLabels: Record<string, string> = {
  call: '电话',
  visit: '拜访',
  email: '邮件',
  wechat: '微信',
};

const typeIcons: Record<string, string> = {
  call: 'call',
  visit: 'location_on',
  email: 'mail',
  wechat: 'chat',
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';

export default function FollowUpWidget({ limit = 5, onSuggestionClick }: FollowUpWidgetProps) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/ai/follow-up-suggestions?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setSuggestions(result.data.items);
      } else {
        setError(result.message || '获取建议失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'completed' | 'dismissed') => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/ai/follow-up-suggestions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('更新状态失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">跟进建议</h3>
        </div>
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">check_circle</span>
          <p className="text-slate-500 dark:text-slate-400 mt-2">暂无待跟进建议</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">跟进建议</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{suggestions.length} 条待处理</span>
      </div>

      <div className="space-y-3">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => onSuggestionClick?.(suggestion)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{typeIcons[suggestion.type]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {suggestion.customer.name}
                    </p>
                    <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[suggestion.priority]}`}>
                      {priorityLabels[suggestion.priority]}优先
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    建议{typeLabels[suggestion.type]}跟进
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(suggestion.id, 'completed');
                  }}
                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded text-emerald-600"
                  title="标记完成"
                >
                  <span className="material-symbols-outlined text-lg">check</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(suggestion.id, 'dismissed');
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                  title="忽略"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
              {suggestion.reason}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}