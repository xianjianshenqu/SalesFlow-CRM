import { useState, useEffect } from 'react';
import { proposalApi, recordingApi } from '../../../../services/api';
import type { RequirementAnalysis } from '../../../../services/api';

interface RequirementAnalysisProps {
  proposalId: string;
  customerId: string;
  onComplete: () => void;
}

export default function RequirementAnalysis({ proposalId, customerId, onComplete }: RequirementAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RequirementAnalysis | null>(null);
  const [sourceType, setSourceType] = useState<'manual' | 'ai_recording' | 'ai_followup'>('manual');
  const [rawContent, setRawContent] = useState('');
  const [selectedRecordingId, setSelectedRecordingId] = useState('');
  const [recordings, setRecordings] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // 加载已有分析
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await proposalApi.getRequirementAnalysis(proposalId);
        setAnalysis(response.data);
        if (response.data) {
          setSourceType(response.data.sourceType);
          setRawContent(response.data.rawContent || '');
        }
      } catch (err) {
        console.error('加载需求分析失败:', err);
      }
    };
    fetchAnalysis();
  }, [proposalId]);

  // 加载客户相关录音
  useEffect(() => {
    const fetchRecordings = async () => {
      if (!customerId) return;
      try {
        const response = await recordingApi.getAll({ customerId, limit: 10 });
        setRecordings(response.data.data || []);
      } catch (err) {
        console.error('加载录音失败:', err);
      }
    };
    fetchRecordings();
  }, [customerId]);

  // AI分析录音
  const handleAiAnalyze = async () => {
    if (!selectedRecordingId) {
      alert('请选择录音');
      return;
    }
    
    try {
      setAiLoading(true);
      const response = await proposalApi.aiAnalyzeRequirement(proposalId, {
        sourceType: 'recording',
        recordingId: selectedRecordingId,
      });
      setAnalysis(response.data);
    } catch (err) {
      console.error('AI分析失败:', err);
      alert('AI分析失败');
    } finally {
      setAiLoading(false);
    }
  };

  // AI增强
  const handleAiEnhance = async () => {
    if (!rawContent.trim()) {
      alert('请先输入需求内容');
      return;
    }
    
    try {
      setAiLoading(true);
      // 先保存原始内容
      await proposalApi.updateRequirementAnalysis(proposalId, { rawContent });
      const response = await proposalApi.aiEnhanceRequirement(proposalId);
      setAnalysis(response.data);
    } catch (err) {
      console.error('AI增强失败:', err);
      alert('AI增强失败');
    } finally {
      setAiLoading(false);
    }
  };

  // 创建/更新需求分析
  const handleSave = async () => {
    try {
      setLoading(true);
      if (analysis) {
        await proposalApi.updateRequirementAnalysis(proposalId, {
          rawContent,
          sourceType,
        });
      } else {
        const response = await proposalApi.createRequirementAnalysis(proposalId, {
          customerId,
          sourceType,
          rawContent,
        });
        setAnalysis(response.data);
      }
      alert('保存成功');
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 确认需求分析
  const handleConfirm = async () => {
    if (!rawContent.trim()) {
      alert('请输入需求内容');
      return;
    }
    
    try {
      setLoading(true);
      await proposalApi.confirmRequirementAnalysis(proposalId, rawContent);
      onComplete();
    } catch (err) {
      console.error('确认失败:', err);
      alert('确认失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">需求分析</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            保存
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !rawContent.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {loading ? '处理中...' : '确认并进入设计阶段'}
          </button>
        </div>
      </div>

      {/* 来源选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">需求来源</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sourceType"
              value="manual"
              checked={sourceType === 'manual'}
              onChange={() => setSourceType('manual')}
              className="text-primary focus:ring-primary"
            />
            <span className="text-slate-700 dark:text-slate-300">手动输入</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sourceType"
              value="ai_recording"
              checked={sourceType === 'ai_recording'}
              onChange={() => setSourceType('ai_recording')}
              className="text-primary focus:ring-primary"
            />
            <span className="text-slate-700 dark:text-slate-300">AI分析录音</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sourceType"
              value="ai_followup"
              checked={sourceType === 'ai_followup'}
              onChange={() => setSourceType('ai_followup')}
              className="text-primary focus:ring-primary"
            />
            <span className="text-slate-700 dark:text-slate-300">AI跟单分析</span>
          </label>
        </div>
      </div>

      {/* AI分析录音 */}
      {sourceType === 'ai_recording' && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">选择录音</label>
          <div className="flex gap-3">
            <select
              value={selectedRecordingId}
              onChange={(e) => setSelectedRecordingId(e.target.value)}
              className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value="">请选择录音...</option>
              {recordings.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} - {new Date(r.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <button
              onClick={handleAiAnalyze}
              disabled={aiLoading || !selectedRecordingId}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-purple-600 transition-colors"
            >
              {aiLoading ? '分析中...' : 'AI分析'}
            </button>
          </div>
        </div>
      )}

      {/* 需求内容输入 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">需求内容</label>
          {sourceType === 'manual' && (
            <button
              onClick={handleAiEnhance}
              disabled={aiLoading || !rawContent.trim()}
              className="text-sm text-purple-500 hover:text-purple-600 disabled:opacity-50"
            >
              {aiLoading ? '处理中...' : '🪄 AI增强'}
            </button>
          )}
        </div>
        <textarea
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
          placeholder="请输入客户需求详情..."
          rows={8}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* AI分析结果 */}
      {analysis?.extractedNeeds && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-3">AI提取的需求</h3>
          <div className="space-y-2">
            {analysis.extractedNeeds.map((need: any, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  need.priority === 'high' ? 'bg-red-100 text-red-600' :
                  need.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {need.priority === 'high' ? '高' : need.priority === 'medium' ? '中' : '低'}
                </span>
                <span className="text-slate-700 dark:text-slate-300">{need.need}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 痛点分析 */}
      {analysis?.painPoints && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <h3 className="font-medium text-amber-700 dark:text-amber-300 mb-3">痛点分析</h3>
          <div className="space-y-2">
            {analysis.painPoints.map((point: any, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span className="text-slate-700 dark:text-slate-300">{point.point}</span>
                <span className="text-xs text-slate-400">({point.category})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 预算线索 */}
      {analysis?.budgetHint && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <h3 className="font-medium text-emerald-700 dark:text-emerald-300 mb-2">预算线索</h3>
          <div className="flex gap-4 text-sm text-slate-700 dark:text-slate-300">
            {analysis.budgetHint.range && <span>预算范围: {analysis.budgetHint.range}</span>}
            {analysis.budgetHint.timeline && <span>时间线: {analysis.budgetHint.timeline}</span>}
          </div>
        </div>
      )}
    </div>
  );
}