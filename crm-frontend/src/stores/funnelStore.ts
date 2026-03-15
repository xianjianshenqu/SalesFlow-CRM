import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Opportunity, Stage } from '../types';
import { mockOpportunities } from '../../data/opportunities';

interface FunnelState {
  opportunities: Opportunity[];
  selectedStage: Stage | 'all';
  addOpportunity: (opportunity: Opportunity) => void;
  updateOpportunity: (id: string, data: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  moveOpportunity: (id: string, newStage: Stage) => void;
  setSelectedStage: (stage: Stage | 'all') => void;
  getOpportunitiesByStage: (stage: Stage) => Opportunity[];
  getStageStats: () => { stage: Stage; count: number; value: number }[];
}

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set, get) => ({
      opportunities: mockOpportunities,
      selectedStage: 'all',
      
      addOpportunity: (opportunity) => {
        set((state) => ({
          opportunities: [...state.opportunities, opportunity]
        }));
      },
      
      updateOpportunity: (id, data) => {
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id ? { ...opp, ...data } : opp
          )
        }));
      },
      
      deleteOpportunity: (id) => {
        set((state) => ({
          opportunities: state.opportunities.filter((opp) => opp.id !== id)
        }));
      },
      
      moveOpportunity: (id, newStage) => {
        set((state) => ({
          opportunities: state.opportunities.map((opp) =>
            opp.id === id ? { ...opp, stage: newStage } : opp
          )
        }));
      },
      
      setSelectedStage: (stage) => {
        set({ selectedStage: stage });
      },
      
      getOpportunitiesByStage: (stage) => {
        return get().opportunities.filter((opp) => opp.stage === stage);
      },
      
      getStageStats: () => {
        const stages: Stage[] = ['new_lead', 'contacted', 'solution', 'negotiation', 'won'];
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