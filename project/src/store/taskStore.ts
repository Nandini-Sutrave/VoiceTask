import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Task } from '../types/task';
import toast from 'react-hot-toast';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: 'pending' | 'in_progress' | 'completed') => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  
  fetchTasks: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ tasks: data as Task[], loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks', 
        loading: false 
      });
    }
  },
  
  addTask: async (taskData: Partial<Task>) => {
    try {
      set({ loading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      
      if (error) throw error;
      
      // Update analytics for task creation
      const today = new Date().toISOString().split('T')[0];
      const { error: analyticsError } = await supabase
        .from('analytics')
        .upsert({
          user_id: user.id,
          date: today,
          tasks_created: 1,
          voice_tasks_created: taskData.voice_created ? 1 : 0
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });
      
      if (analyticsError) {
        console.error('Error updating analytics:', analyticsError);
      }
      
      set(state => ({ 
        tasks: [data[0] as Task, ...state.tasks], 
        loading: false 
      }));
      
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add task', 
        loading: false 
      });
      throw error;
    }
  },
  
  updateTask: async (id: string, taskData: Partial<Task>) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('tasks')
        .update({
          ...taskData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...taskData, updated_at: new Date().toISOString() } : task
        ),
        loading: false
      }));
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task', 
        loading: false 
      });
      toast.error('Failed to update task');
    }
  },
  
  deleteTask: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        loading: false
      }));
      
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task', 
        loading: false 
      });
      toast.error('Failed to delete task');
    }
  },
  
  toggleTaskCompletion: async (id: string) => {
    try {
      const { tasks } = get();
      const task = tasks.find(t => t.id === id);
      
      if (!task) return;
      
      const isCompleted = task.status === 'completed';
      const newStatus = isCompleted ? 'pending' : 'completed';
      const completedAt = isCompleted ? null : new Date().toISOString();
      
      await get().updateTask(id, { 
        status: newStatus,
        completed_at: completedAt 
      });
      
      // Update analytics for task completion if task is being completed
      if (!isCompleted) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const today = new Date().toISOString().split('T')[0];
          const { error: analyticsError } = await supabase
            .from('analytics')
            .upsert({
              user_id: user.id,
              date: today,
              tasks_completed: 1
            }, {
              onConflict: 'user_id,date',
              ignoreDuplicates: false
            });
          
          if (analyticsError) {
            console.error('Error updating analytics:', analyticsError);
          }
        }
      }
      
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  },
  
  updateTaskStatus: async (id: string, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      
      await get().updateTask(id, { 
        status,
        completed_at: completedAt 
      });
      
      // Update analytics if completing task
      if (status === 'completed') {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const today = new Date().toISOString().split('T')[0];
          const { error: analyticsError } = await supabase
            .from('analytics')
            .upsert({
              user_id: user.id,
              date: today,
              tasks_completed: 1
            }, {
              onConflict: 'user_id,date',
              ignoreDuplicates: false
            });
          
          if (analyticsError) {
            console.error('Error updating analytics:', analyticsError);
          }
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }
}));