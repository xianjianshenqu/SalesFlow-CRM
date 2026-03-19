import { useState, useEffect } from 'react';
import type { Proposal } from '../../../../services/api';
import type { ProposalReview } from '../../../../services/api';
import { proposalApi, teamApi } from '../../../../services/api';

interface InternalReviewProps {
  proposalId: string;
  proposal: Proposal;
  onComplete: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export default function InternalReview({ proposalId, proposal, onComplete }: InternalReviewProps) {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<ProposalReview | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [selectedSharedIds, setSelectedSharedIds] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [resultNotes, setResultNotes] = useState('');

  // 加载评审信息
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await proposalApi.getReview(proposalId);
        setReview(response.data);
        if (response.data) {
          setSelectedReviewerId(response.data.reviewerId || '');
          setSelectedSharedIds(response.data.sharedWith || []);
        }
      } catch (err) {
        console.error('加载评审信息失败:', err);
      }
    };
    fetchReview();
  }, [proposalId]);

  // 加载团队成员
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await teamApi.getMembers();
        setTeamMembers(response.data || []);
      } catch (err) {
        console.error('加载团队成员失败:', err);
      }
    };
    fetchTeamMembers();
  }, []);

  // 发起评审
  const handleCreateReview = async () => {
    try {
      setLoading(true);
      const response = await proposalApi.createReview(proposalId, {
        reviewerId: selectedReviewerId || undefined,
        sharedWith: selectedSharedIds.length > 0 ? selectedSharedIds : undefined,
      });
      setReview(response.data);
      alert('评审已发起');
    } catch (err) {
      console.error('发起评审失败:', err);
      alert('发起评审失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加评论
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      setLoading(true);
      const response = await proposalApi.addReviewComment(proposalId, comment);
      setReview(response.data);
      setComment('');
    } catch (err) {
      console.error('添加评论失败:', err);
      alert('添加评论失败');
    } finally {
      setLoading(false);
    }
  };

  // 通过评审
  const handleApprove = async () => {
    try {
      setLoading(true);
      await proposalApi.approveReview(proposalId, resultNotes || undefined);
      onComplete();
    } catch (err) {
      console.error('审批失败:', err);
      alert('审批失败');
    } finally {
      setLoading(false);
    }
  };

  // 进入客户提案阶段
  const handleProceedToCustomerProposal = async () => {
    if (!proposal.customer?.email) {
      alert('客户邮箱不存在，请先完善客户信息');
      return;
    }
    
    try {
      setLoading(true);
      await proposalApi.createCustomerProposal(proposalId, {
        emailTo: proposal.customer.email,
      });
      onComplete();
    } catch (err) {
      console.error('进入客户提案阶段失败:', err);
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 驳回评审
  const handleReject = async () => {
    if (!resultNotes.trim()) {
      alert('请填写驳回原因');
      return;
    }
    
    try {
      setLoading(true);
      await proposalApi.rejectReview(proposalId, resultNotes);
      onComplete();
    } catch (err) {
      console.error('驳回失败:', err);
      alert('驳回失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换共享成员
  const toggleSharedMember = (memberId: string) => {
    setSelectedSharedIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="space-y-6">
      {/* 评审状态卡片 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">内部评审</h2>
        
        {!review ? (
          <div className="space-y-4">
            {/* 发起评审表单 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                指定评审人（可选）
              </label>
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">不指定，由管理员分配</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                共享给团队（可选）
              </label>
              <div className="flex flex-wrap gap-2">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => toggleSharedMember(member.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedSharedIds.includes(member.id)
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateReview}
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {loading ? '提交中...' : '发起评审'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 评审状态 */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">评审状态</p>
                <p className={`font-medium ${
                  review.status === 'approved' ? 'text-emerald-500' :
                  review.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {review.status === 'approved' ? '已通过' :
                   review.status === 'rejected' ? '已驳回' : '待审批'}
                </p>
              </div>
              {review.reviewerId && (
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">评审人</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {teamMembers.find(m => m.id === review.reviewerId)?.name || '未知'}
                  </p>
                </div>
              )}
            </div>

            {/* 共享团队成员 */}
            {review.sharedWith && review.sharedWith.length > 0 && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">已共享给</p>
                <div className="flex flex-wrap gap-2">
                  {review.sharedWith.map((id) => (
                    <span key={id} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                      {teamMembers.find(m => m.id === id)?.name || id}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 评审意见列表 */}
            {review.comments && review.comments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">评审意见</p>
                <div className="space-y-3">
                  {review.comments.map((c, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {teamMembers.find(m => m.id === c.userId)?.name || '用户'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 添加评论 */}
            {review.status === 'pending' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="添加评审意见..."
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={loading || !comment.trim()}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50"
                >
                  发送
                </button>
              </div>
            )}

            {/* 审批操作 */}
            {review.status === 'pending' && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <textarea
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  placeholder="审批意见（驳回时必填）..."
                  rows={2}
                  className="w-full px-4 py-2 mb-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-emerald-600 transition-colors"
                  >
                    通过评审
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-red-600 transition-colors"
                  >
                    驳回
                  </button>
                </div>
              </div>
            )}

            {/* 审批结果 */}
            {review.status !== 'pending' && review.resultNotes && (
              <div className={`p-4 rounded-lg ${
                review.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <p className={`font-medium ${
                  review.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  审批结果: {review.status === 'approved' ? '通过' : '驳回'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{review.resultNotes}</p>
              </div>
            )}

            {/* 评审通过后进入客户提案阶段 */}
            {review.status === 'approved' && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleProceedToCustomerProposal}
                  disabled={loading}
                  className="w-full py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {loading ? '处理中...' : '进入客户提案阶段'}
                </button>
              </div>
            )}

            {/* 评审驳回后返回设计阶段 */}
            {review.status === 'rejected' && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  方案已被驳回，请修改后重新提交评审
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 方案预览 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">方案预览</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">方案标题</span>
            <span className="text-slate-900 dark:text-white">{proposal.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">方案金额</span>
            <span className="font-medium text-primary">¥{proposal.value.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">客户</span>
            <span className="text-slate-900 dark:text-white">{proposal.customer?.name}</span>
          </div>
          {proposal.description && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 mb-1">方案描述</p>
              <p className="text-slate-700 dark:text-slate-300">{proposal.description}</p>
            </div>
          )}
          {proposal.products && proposal.products.length > 0 && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 mb-2">产品清单</p>
              <div className="space-y-1">
                {proposal.products.map((p, i) => (
                  <div key={i} className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{p.name} x{p.quantity}</span>
                    <span>¥{p.totalPrice?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}