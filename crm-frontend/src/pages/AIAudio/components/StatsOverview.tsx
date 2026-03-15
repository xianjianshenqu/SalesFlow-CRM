import type { RecordingStats } from '../../../types';

interface StatsOverviewProps {
  stats: RecordingStats;
  isLoading?: boolean;
}

// 格式化时长
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const totalSentiment = stats.sentimentDistribution.positive + 
    stats.sentimentDistribution.neutral + 
    stats.sentimentDistribution.negative;

  const sentimentPercentages = {
    positive: totalSentiment > 0 ? Math.round((stats.sentimentDistribution.positive / totalSentiment) * 100) : 0,
    neutral: totalSentiment > 0 ? Math.round((stats.sentimentDistribution.neutral / totalSentiment) * 100) : 0,
    negative: totalSentiment > 0 ? Math.round((stats.sentimentDistribution.negative / totalSentiment) * 100) : 0,
  };

  return (
    <div className="space-y-4">
      {/* 主要统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500 text-lg">mic</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">总录音数</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.total}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            今日 +{stats.todayCount}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-lg">schedule</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">总时长</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {formatDuration(stats.totalDuration)}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            平均 {formatDuration(stats.averageDuration)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-500 text-lg">auto_awesome</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">分析完成</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.analyzedRate}%</p>
          <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.analyzedRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500 text-lg">verified</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">AI准确率</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.aiAccuracy}%</p>
          <p className="text-xs text-emerald-500 mt-1">
            <span className="material-symbols-outlined text-xs align-middle">trending_up</span>
            高准确度
          </p>
        </div>
      </div>

      {/* 情感分布 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">情感分布</h4>
        <div className="flex items-center gap-4">
          {/* 积极 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-500 text-sm">sentiment_satisfied</span>
                积极
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {stats.sentimentDistribution.positive} ({sentimentPercentages.positive}%)
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${sentimentPercentages.positive}%` }}
              />
            </div>
          </div>

          {/* 中性 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">sentiment_neutral</span>
                中性
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {stats.sentimentDistribution.neutral} ({sentimentPercentages.neutral}%)
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-400 rounded-full transition-all duration-500"
                style={{ width: `${sentimentPercentages.neutral}%` }}
              />
            </div>
          </div>

          {/* 消极 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-red-500 text-sm">sentiment_dissatisfied</span>
                消极
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {stats.sentimentDistribution.negative} ({sentimentPercentages.negative}%)
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${sentimentPercentages.negative}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}