import { useState } from 'react';
import type { AudioRecording, Sentiment } from '../../../types';

interface AIAnalysisPanelProps {
  recording: AudioRecording;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

// 情感图标配置
const sentimentConfig: Record<Sentiment, { icon: string; color: string; bg: string; label: string }> = {
  positive: { 
    icon: 'sentiment_satisfied', 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    label: '积极' 
  },
  neutral: { 
    icon: 'sentiment_neutral', 
    color: 'text-slate-400', 
    bg: 'bg-slate-50 dark:bg-slate-800',
    label: '中性' 
  },
  negative: { 
    icon: 'sentiment_dissatisfied', 
    color: 'text-red-500', 
    bg: 'bg-red-50 dark:bg-red-900/30',
    label: '消极' 
  },
};

// 态度配置
const attitudeConfig: Record<string, { label: string; color: string }> = {
  interested: { label: '感兴趣', color: 'text-emerald-500' },
  neutral: { label: '中立', color: 'text-slate-500' },
  resistant: { label: '抵触', color: 'text-red-500' },
};

// 购买意向配置
const intentConfig: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: 'text-emerald-500' },
  medium: { label: '中', color: 'text-amber-500' },
  low: { label: '低', color: 'text-red-500' },
};

export function AIAnalysisPanel({ recording, onAnalyze, isAnalyzing }: AIAnalysisPanelProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  
  const sentiment = recording.sentiment || 'neutral';
  const sentimentInfo = sentimentConfig[sentiment];
  const psychology = recording.psychology;
  const isAnalyzed = recording.status === 'analyzed';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* 头部状态 */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-full ${sentimentInfo.bg} flex items-center justify-center`}>
            <span className={`material-symbols-outlined ${sentimentInfo.color}`}>
              {isAnalyzed ? sentimentInfo.icon : 'pending'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">AI 分析结果</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAnalyzed ? `情感倾向: ${sentimentInfo.label}` : '等待分析'}
            </p>
          </div>
        </div>
        
        {!isAnalyzed && (
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                分析中...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                开始分析
              </>
            )}
          </button>
        )}
      </div>

      {/* 分析进度条 */}
      {isAnalyzing && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">正在进行AI分析...</p>
              <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分析结果内容 */}
      {isAnalyzed && (
        <div className="p-4 space-y-4">
          {/* 摘要 */}
          <div>
            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">通话摘要</h5>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {recording.summary || '暂无摘要'}
            </p>
          </div>

          {/* 关键词 */}
          {recording.keywords && recording.keywords.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">关键词</h5>
              <div className="flex flex-wrap gap-2">
                {recording.keywords.map((keyword, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary rounded-full text-xs font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 关键点 */}
          {recording.keyPoints && recording.keyPoints.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">关键点</h5>
              <div className="space-y-2">
                {recording.keyPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 客户心理分析 */}
          {psychology && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">客户心理分析</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">态度倾向</p>
                  <p className={`text-sm font-medium ${attitudeConfig[psychology.attitude]?.color || ''}`}>
                    {attitudeConfig[psychology.attitude]?.label || psychology.attitude}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">购买意向</p>
                  <p className={`text-sm font-medium ${intentConfig[psychology.purchaseIntent]?.color || ''}`}>
                    {intentConfig[psychology.purchaseIntent]?.label || psychology.purchaseIntent}
                  </p>
                </div>
              </div>
              
              {psychology.painPoints && psychology.painPoints.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">痛点</p>
                  <div className="flex flex-wrap gap-1">
                    {psychology.painPoints.map((point, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {psychology.concerns && psychology.concerns.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">顾虑</p>
                  <div className="flex flex-wrap gap-1">
                    {psychology.concerns.map((concern, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 转录文本 */}
          {recording.transcript && (
            <div>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {showTranscript ? 'expand_less' : 'expand_more'}
                </span>
                通话转录
              </button>
              
              {showTranscript && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">
                    {recording.transcript}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}