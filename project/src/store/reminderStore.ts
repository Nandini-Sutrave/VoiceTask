import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Reminder } from '../types/task';
import toast from 'react-hot-toast';

interface ReminderState {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  addReminder: (taskId: string, remindAt: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  checkReminders: () => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  loading: false,
  error: null,
  
  fetchReminders: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('remind_at', { ascending: true });
      
      if (error) throw error;
      
      set({ reminders: data as Reminder[], loading: false });
    } catch (error) {
      console.error('Error fetching reminders:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch reminders', 
        loading: false 
      });
    }
  },
  
  addReminder: async (taskId: string, remindAt: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          task_id: taskId,
          user_id: user.id,
          remind_at: remindAt,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      set(state => ({ 
        reminders: [...state.reminders, data[0] as Reminder],
        loading: false 
      }));
      
      toast.success('Reminder set successfully');
    } catch (error) {
      console.error('Error adding reminder:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add reminder', 
        loading: false 
      });
      toast.error('Failed to set reminder');
    }
  },
  
  deleteReminder: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        reminders: state.reminders.filter(reminder => reminder.id !== id),
        loading: false
      }));
      
      toast.success('Reminder deleted successfully');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete reminder', 
        loading: false 
      });
      toast.error('Failed to delete reminder');
    }
  },
  
  // Check for due reminders
  checkReminders: async () => {
    try {
      const { reminders } = get();
      const now = new Date();
      
      // Find reminders that are due
      const dueReminders = reminders.filter(reminder => {
        const remindTime = new Date(reminder.remind_at);
        return remindTime <= now;
      });
      
      // Show notifications for due reminders
      if (dueReminders.length > 0) {
        // Fetch tasks associated with reminders
        const taskIds = dueReminders.map(reminder => reminder.task_id);
        
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .in('id', taskIds);
        
        if (error) throw error;
        
        // Show notifications
        for (const reminder of dueReminders) {
          const task = tasks.find(t => t.id === reminder.task_id);
          
          if (task) {
            // Use browser notifications if permitted
            if (Notification.permission === 'granted') {
              new Notification('Task Reminder', {
                body: `Reminder: ${task.title}`,
                icon: '/vite.svg'
              });
            }
            
            // Show toast notification
            toast(`Reminder: ${task.title}`, {
              duration: 6000,
              icon: '⏰'
            });
          }
          
          // Delete the reminder once shown
          get().deleteReminder(reminder.id);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }
}));