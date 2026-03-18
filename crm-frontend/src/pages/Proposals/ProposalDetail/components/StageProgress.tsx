import type { ProposalStatus } from '../../../../services/api';

interface StageProgressProps {
  currentStatus: ProposalStatus;
}

// 阶段配置
const STAGES = [
  { num: 1, title: '需求分析', icon: 'assignment', statuses: ['requirement_analysis'] as ProposalStatus[] },
  { num: 2, title: '方案设计', icon: 'design_services', statuses: ['designing'] as ProposalStatus[] },
  { num: 3, title: '内部评审', icon: 'rate_review', statuses: ['pending_review', 'review_passed', 'review_rejected'] as ProposalStatus[] },
  { num: 4, title: '客户提案', icon: 'send', statuses: ['customer_proposal', 'sent'] as ProposalStatus[] },
  { num: 5, title: '商务谈判', icon: 'handshake', statuses: ['negotiation'] as ProposalStatus[] },
];

// 终态
const TERMINAL_STATUSES: ProposalStatus[] = ['accepted', 'rejected', 'expired'];

export default function StageProgress({ currentStatus }: StageProgressProps) {
  // 判断当前阶段
  const getCurrentStage = (): number => {
    if (currentStatus === 'draft') return 0;
    if (TERMINAL_STATUSES.includes(currentStatus)) return 6;
    
    for (let i = 0; i < STAGES.length; i++) {
      if (STAGES[i].statuses.includes(currentStatus)) {
        return i + 1;
      }
    }
    return 0;
  };

  const currentStage = getCurrentStage();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">方案进度</h3>
      
      {/* 草稿状态 */}
      {currentStatus === 'draft' && (
        <div className="text-center py-4 text-amber-600 dark:text-amber-400">
          <span className="material-symbols-outlined text-2xl">edit_note</span>
          <p className="text-sm mt-1">请先完成需求分析</p>
        </div>
      )}
      
      {/* 终态显示 */}
      {TERMINAL_STATUSES.includes(currentStatus) && (
        <div className="text-center py-4">
          <span className={`material-symbols-outlined text-2xl ${
            currentStatus === 'accepted' ? 'text-emerald-500' : 'text-slate-400'
          }`}>
            {currentStatus === 'accepted' ? 'check_circle' : currentStatus === 'rejected' ? 'cancel' : 'description'}
          </span>
          <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
            {currentStatus === 'accepted' ? '方案已接受' : 
             currentStatus === 'rejected' ? '方案已拒绝' : 
             currentStatus === 'sent' ? '方案已发送' : '方案已过期'}
          </p>
        </div>
      )}
      
      {/* 进度条 */}
      {!TERMINAL_STATUSES.includes(currentStatus) && currentStatus !== 'draft' && (
        <div className="flex items-start justify-between">
          {STAGES.map((stage, index) => {
            const isCompleted = currentStage > stage.num;
            const isCurrent = currentStage === stage.num;
            
            return (
              <div key={stage.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`size-12 rounded-xl flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isCurrent 
                        ? 'bg-primary text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined">check</span>
                    ) : (
                      <span className="material-symbols-outlined">{stage.icon}</span>
                    )}
                  </div>
                  <p className={`text-sm font-medium mt-2 ${
                    isCurrent 
                      ? 'text-primary' 
                      : isCompleted 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-400'
                  }`}>
                    {stage.title}
                  </p>
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1 animate-pulse"></div>
                  )}
                </div>
                
                {index < STAGES.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 mt-6 ${
                    currentStage > stage.num + 1 
                      ? 'bg-emerald-500' 
                      : currentStage === stage.num + 1 
                        ? 'bg-primary' 
                        : 'bg-slate-200 dark:bg-slate-700'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}