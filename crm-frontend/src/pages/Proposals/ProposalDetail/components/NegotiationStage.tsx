import { useState, useEffect } from 'react';
import type { Proposal } from '../../../../services/api';
import type { NegotiationRecord } from '../../../../services/api';
import { proposalApi } from '../../../../services/api';

interface NegotiationStageProps {
  proposalId: string;
  proposal: Proposal;
  onComplete: () => void;
}

interface Discussion {
  date: string;
  content: string;
  participants?: string[];
}

interface AgreedTerm {
  term: string;
  value: string;
  confirmed?: boolean;
}

export default function NegotiationStage({ proposalId, proposal, onComplete }: NegotiationStageProps) {
  const [loading, setLoading] = useState(false);
  const [negotiation, setNegotiation] = useState<NegotiationRecord | null>(null);
  
  // 新讨论表单
  const [newDiscussion, setNewDiscussion] = useState({
    content: '',
    participants: '',
  });

  // 条款列表
  const [agreedTerms, setAgreedTerms] = useState<AgreedTerm[]>([]);

  // 加载谈判记录
  useEffect(() => {
    const fetchNegotiation = async () => {
      try {
        const response = await proposalApi.getNegotiation(proposalId);
        setNegotiation(response.data);
        if (response.data?.agreedTerms) {
          setAgreedTerms(response.data.agreedTerms as AgreedTerm[]);
        }
      } catch (err) {
        console.error('加载谈判记录失败:', err);
      }
    };
    fetchNegotiation();
  }, [proposalId]);

  // 创建谈判记录
  const handleCreateNegotiation = async () => {
    try {
      setLoading(true);
      const response = await proposalApi.createNegotiation(proposalId);
      setNegotiation(response.data);
    } catch (err) {
      console.error('创建谈判记录失败:', err);
      alert('创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加讨论记录
  const handleAddDiscussion = async () => {
    if (!newDiscussion.content.trim()) return;
    
    try {
      setLoading(true);
      const participants = newDiscussion.participants.split(',').map(s => s.trim()).filter(Boolean);
      const response = await proposalApi.addDiscussion(proposalId, {
        content: newDiscussion.content,
        participants: participants.length > 0 ? participants : undefined,
      });
      setNegotiation(response.data);
      setNewDiscussion({ content: '', participants: '' });
    } catch (err) {
      console.error('添加讨论记录失败:', err);
      alert('添加失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加条款
  const handleAddTerm = () => {
    setAgreedTerms(prev => [...prev, { term: '', value: '', confirmed: false }]);
  };

  // 更新条款
  const handleUpdateTerm = (index: number, field: 'term' | 'value', value: string) => {
    setAgreedTerms(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 删除条款
  const handleRemoveTerm = (index: number) => {
    setAgreedTerms(prev => prev.filter((_, i) => i !== index));
  };

  // 确认条款
  const handleConfirmTerm = (index: number) => {
    setAgreedTerms(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], confirmed: true };
      return updated;
    });
  };

  // 保存条款
  const handleSaveTerms = async () => {
    try {
      setLoading(true);
      const response = await proposalApi.updateNegotiationTerms(proposalId, agreedTerms);
      setNegotiation(response.data);
      alert('保存成功');
    } catch (err) {
      console.error('保存条款失败:', err);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 完成谈判
  const handleComplete = async () => {
    if (!confirm('确认完成商务谈判？完成后方案将标记为已发送。')) return;
    
    try {
      setLoading(true);
      await proposalApi.completeNegotiation(proposalId);
      onComplete();
    } catch (err) {
      console.error('完成谈判失败:', err);
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 讨论记录
  const discussions: Discussion[] = negotiation?.discussions || [];

  if (!negotiation) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-center">
        <span className="material-symbols-outlined text-4xl text-amber-500">handshake</span>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">开始商务谈判</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-4">客户已确认意向，开始进行条款协商</p>
        <button
          onClick={handleCreateNegotiation}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          开始谈判
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 讨论记录 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">讨论记录</h2>
        
        {/* 时间线 */}
        {discussions.length > 0 && (
          <div className="relative pb-4 mb-4">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="space-y-4">
              {discussions.map((d, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(d.date).toLocaleString()}
                      </span>
                      {d.participants && d.participants.length > 0 && (
                        <div className="flex gap-1">
                          {d.participants.map((p, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">{d.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 添加新讨论 */}
        <div className="space-y-3">
          <textarea
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
            placeholder="记录讨论内容..."
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newDiscussion.participants}
              onChange={(e) => setNewDiscussion(prev => ({ ...prev, participants: e.target.value }))}
              placeholder="参与人（逗号分隔）"
              className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleAddDiscussion}
              disabled={loading || !newDiscussion.content.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              添加记录
            </button>
          </div>
        </div>
      </div>

      {/* 条款确认 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">条款确认</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAddTerm}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              添加条款
            </button>
          </div>
        </div>

        {agreedTerms.length > 0 ? (
          <div className="space-y-3 mb-4">
            {agreedTerms.map((term, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <input
                  type="text"
                  value={term.term}
                  onChange={(e) => handleUpdateTerm(index, 'term', e.target.value)}
                  placeholder="条款名称"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  value={term.value}
                  onChange={(e) => handleUpdateTerm(index, 'value', e.target.value)}
                  placeholder="约定内容"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={() => handleConfirmTerm(index)}
                  className={`p-2 rounded-lg ${term.confirmed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {term.confirmed ? 'check' : 'check_box_outline_blank'}
                  </span>
                </button>
                <button
                  onClick={() => handleRemoveTerm(index)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500">
            暂无条款，点击添加条款开始协商
          </div>
        )}

        <button
          onClick={handleSaveTerms}
          disabled={loading || agreedTerms.length === 0}
          className="w-full py-2 text-slate-600 dark:text-slate-400 hover:text-primary disabled:opacity-50 transition-colors"
        >
          保存条款
        </button>
      </div>

      {/* 完成谈判 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">完成谈判</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">确认所有条款后，点击完成</p>
          </div>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-emerald-600 transition-colors"
          >
            {loading ? '处理中...' : '完成谈判'}
          </button>
        </div>
      </div>
    </div>
  );
}