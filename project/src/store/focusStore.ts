import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { FocusSession } from '../types/task';
import toast from 'react-hot-toast';

interface FocusState {
  sessions: FocusSession[];
  currentSession: FocusSession | null;
  loading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  startSession: (taskId?: string, sessionType?: 'pomodoro' | 'deep_work' | 'break' | 'custom') => Promise<void>;
  endSession: (notes?: string) => Promise<void>;
  addInterruption: () => Promise<void>;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  
  fetchSessions: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      
      set({ sessions: data as FocusSession[], loading: false });
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch sessions', 
        loading: false 
      });
    }
  },
  
  startSession: async (taskId?: string, sessionType: 'pomodoro' | 'deep_work' | 'break' | 'custom' = 'pomodoro') => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          task_id: taskId || null,
          start_time: new Date().toISOString(),
          session_type: sessionType,
          interruptions: 0
        })
        .select();
      
      if (error) throw error;
      
      set(state => ({ 
        currentSession: data[0] as FocusSession,
        sessions: [data[0] as FocusSession, ...state.sessions],
        loading: false 
      }));
      
      toast.success('Focus session started!');
    } catch (error) {
      console.error('Error starting focus session:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to start session', 
        loading: false 
      });
      toast.error('Failed to start focus session');
    }
  },
  
  endSession: async (notes?: string) => {
    try {
      const { currentSession } = get();
      
      if (!currentSession) {
        throw new Error('No active session');
      }
      
      const endTime = new Date();
      const startTime = new Date(currentSession.start_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      const { error } = await supabase
        .from('focus_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: durationMinutes,
          notes: notes || null
        })
        .eq('id', currentSession.id);
      
      if (error) throw error;
      
      // Update analytics
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const { error: analyticsError } = await supabase
          .from('analytics')
          .upsert({
            user_id: user.id,
            date: today,
            focus_minutes: durationMinutes
          }, {
            onConflict: 'user_id,date',
            ignoreDuplicates: false
          });
        
        if (analyticsError) {
          console.error('Error updating analytics:', analyticsError);
        }
      }
      
      set(state => ({
        currentSession: null,
        sessions: state.sessions.map(session => 
          session.id === currentSession.id 
            ? { ...session, end_time: endTime.toISOString(), duration_minutes: durationMinutes, notes }
            : session
        )
      }));
      
      toast.success(`Focus session completed! Duration: ${durationMinutes} minutes`);
    } catch (error) {
      console.error('Error ending focus session:', error);
      toast.error('Failed to end focus session');
    }
  },
  
  addInterruption: async () => {
    try {
      const { currentSession } = get();
      
      if (!currentSession) return;
      
      const newInterruptions = (currentSession.interruptions || 0) + 1;
      
      const { error } = await supabase
        .from('focus_sessions')
        .update({
          interruptions: newInterruptions
        })
        .eq('id', currentSession.id);
      
      if (error) throw error;
      
      set(state => ({
        currentSession: state.currentSession 
          ? { ...state.currentSession, interruptions: newInterruptions }
          : null,
        sessions: state.sessions.map(session => 
          session.id === currentSession.id 
            ? { ...session, interruptions: newInterruptions }
            : session
        )
      }));
      
    } catch (error) {
      console.error('Error adding interruption:', error);
    }
  }
}));