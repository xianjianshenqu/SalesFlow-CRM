import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Opportunity, Stage } from '../types';
import { mockOpportunities } from '../data/opportunities';
import { opportunityApi } from '../services/api';

interface FunnelState {
  opportunities: Opportunity[];
  selectedStage: Stage | 'all';
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchOpportunities: () => Promise<void>;
  addOpportunity: (opportunity: Opportunity) => Promise<void>;
  addOpportunityLocal: (opportunity: Opportunity) => void;
  updateOpportunity: (id: string, data: Partial<Opportunity>) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;
  moveOpportunity: (id: string, newStage: Stage) => Promise<void>;
  setSelectedStage: (stage: Stage | 'all') => void;
  getOpportunitiesByStage: (stage: Stage) => Opportunity[];
  getStageStats: () => { stage: Stage; count: number; value: number }[];
}

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set, get) => ({
      opportunities: mockOpportunities,
      selectedStage: 'all',
      loading: false,
      error: null,
      
      // 从 API 获取商机列表
      fetchOpportunities: async () => {
        set({ loading: true, error: null });
        try {
          const response = await opportunityApi.getAll();
          // 转换 API 响应格式到本地格式
          const opportunities = response.data.map((opp: any) => ({
            id: opp.id,
            customerId: opp.customerId,
            customerName: opp.customer?.name || '',
            title: opp.title,
            stage: opp.stage as Stage,
            value: Number(opp.value),
            probability: opp.probability,
            owner: opp.owner?.name || '未分配',
            ownerAvatar: opp.owner?.avatar,
            priority: opp.priority as 'high' | 'medium' | 'low',
            expectedCloseDate: opp.expectedCloseDate || '',
            lastActivity: opp.lastActivity || opp.createdAt,
            description: opp.description || '',
            nextStep: opp.nextStep || ''
          }));
          set({ opportunities, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取商机失败', loading: false });
        }
      },
      
      // 通过 API 创建商机
      addOpportunity: async (opportunity) => {
        try {
          const response = await opportunityApi.create({
            customerId: opportunity.customerId,
            title: opportunity.title,
            stage: opportunity.stage,
            value: opportunity.value,
            probability: opportunity.probability,
            priority: opportunity.priority,
            expectedCloseDate: opportunity.expectedCloseDate || undefined,
            description: opportunity.description || undefined,
            nextStep: opportunity.nextStep || undefined
          });
          
          // 添加到本地列表
          set((state) => ({
            opportunities: [...state.opportunities, {
              ...opportunity,
              id: response.data.id
            }]
          }));
        } catch (error) {
          console.error('Failed to create opportunity:', error);
          throw error;
        }
      },
      
      // 仅本地添加（当从其他地方创建时使用）
      addOpportunityLocal: (opportunity) => {
        set((state) => ({
          opportunities: [...state.opportunities, opportunity]
        }));
      },
      
      // 通过 API 更新商机
      updateOpportunity: async (id, data) => {
        try {
          await opportunityApi.update(id, data);
          set((state) => ({
            opportunities: state.opportunities.map((opp) =>
              opp.id === id ? { ...opp, ...data } : opp
            )
          }));
        } catch (error) {
          console.error('Failed to update opportunity:', error);
          throw error;
        }
      },
      
      // 通过 API 删除商机
      deleteOpportunity: async (id) => {
        try {
          await opportunityApi.delete(id);
          set((state) => ({
            opportunities: state.opportunities.filter((opp) => opp.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete opportunity:', error);
          throw error;
        }
      },
      
      // 通过 API 移动商机阶段
      moveOpportunity: async (id, newStage) => {
        try {
          await opportunityApi.moveStage(id, newStage);
          set((state) => ({
            opportunities: state.opportunities.map((opp) =>
              opp.id === id ? { ...opp, stage: newStage } : opp
            )
          }));
        } catch (error) {
          console.error('Failed to move opportunity:', error);
          throw error;
        }
      },
      
      setSelectedStage: (stage) => {
        set({ selectedStage: stage });
      },
      
      getOpportunitiesByStage: (stage) => {
        return get().opportunities.filter((opp) => opp.stage === stage);
      },
      
      getStageStats: () => {
        const stages: Stage[] = ['new_lead', 'quoted', 'negotiation', 'procurement_process', 'contract_stage', 'won'];
        return stages.map((stage) => {
          const stageOpportunities = get().opportunities.filter((opp) => opp.stage === stage);
          return {
            stage,
            count: stageOpportunities.length,
            value: stageOpportunities.reduce((sum, opp) => sum + opp.value, 0)
          };
        });
      }
    }),
    {
      name: 'crm-funnel'
    }
  )
);