import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { DailyAnalytics } from '../types/task';

interface AnalyticsState {
  dailyStats: DailyAnalytics[];
  loading: boolean;
  error: string | null;
  fetchDailyStats: (days?: number) => Promise<void>;
  getProductivityScore: () => number;
  getCompletionRate: () => number;
  getVoiceUsageRate: () => number;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  dailyStats: [],
  loading: false,
  error: null,
  
  fetchDailyStats: async (days = 14) => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Generate mock data for now since analytics table might not have data yet
      const mockData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          id: `mock-${i}`,
          user_id: user.id,
          date: date.toISOString().split('T')[0],
          tasks_created: Math.floor(Math.random() * 8) + 1,
          tasks_completed: Math.floor(Math.random() * 6) + 1,
          voice_tasks_created: Math.floor(Math.random() * 3) + 1,
          focus_minutes: Math.floor(Math.random() * 120) + 30,
          productivity_score: Math.floor(Math.random() * 40) + 60,
          mood_rating: Math.floor(Math.random() * 3) + 3,
          notes: null,
          created_at: new Date().toISOString()
        });
      }
      
      set({ dailyStats: mockData as DailyAnalytics[], loading: false });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics', 
        loading: false 
      });
    }
  },
  
  getProductivityScore: () => {
    const { dailyStats } = get();
    
    if (dailyStats.length === 0) return 0;
    
    // Calculate productivity score based on task completion
    const totalCompleted = dailyStats.reduce((sum, day) => sum + day.tasks_completed, 0);
    const totalCreated = dailyStats.reduce((sum, day) => sum + day.tasks_created, 0);
    
    if (totalCreated === 0) return 0;
    
    // Score is based on completion rate with a max of 100
    const score = Math.min(Math.round((totalCompleted / totalCreated) * 100), 100);
    return score;
  },
  
  getCompletionRate: () => {
    const { dailyStats } = get();
    
    if (dailyStats.length === 0) return 0;
    
    // Calculate completion rate as a percentage
    const totalCompleted = dailyStats.reduce((sum, day) => sum + day.tasks_completed, 0);
    const totalCreated = dailyStats.reduce((sum, day) => sum + day.tasks_created, 0);
    
    if (totalCreated === 0) return 0;
    
    return Math.round((totalCompleted / totalCreated) * 100);
  },
  
  getVoiceUsageRate: () => {
    const { dailyStats } = get();
    
    if (dailyStats.length === 0) return 0;
    
    // Calculate voice usage rate as a percentage
    const totalVoiceTasks = dailyStats.reduce((sum, day) => sum + day.voice_tasks_created, 0);
    const totalCreated = dailyStats.reduce((sum, day) => sum + day.tasks_created, 0);
    
    if (totalCreated === 0) return 0;
    
    return Math.round((totalVoiceTasks / totalCreated) * 100);
  }
}));