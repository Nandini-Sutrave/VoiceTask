export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          completed_at: string | null
          due_date: string | null
          due_time: string | null
          priority: 'low' | 'medium' | 'high'
          user_id: string
          tags: string[]
          voice_created: boolean | null
          voice_confidence: number | null
          ai_suggested: boolean | null
          estimated_duration: number | null
          actual_duration: number | null
          category: string | null
          location: string | null
          notes: string | null
          updated_at: string | null
          status: 'pending' | 'in_progress' | 'completed'
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          completed_at?: string | null
          due_date?: string | null
          due_time?: string | null
          priority?: 'low' | 'medium' | 'high'
          user_id: string
          tags?: string[]
          voice_created?: boolean | null
          voice_confidence?: number | null
          ai_suggested?: boolean | null
          estimated_duration?: number | null
          actual_duration?: number | null
          category?: string | null
          location?: string | null
          notes?: string | null
          updated_at?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          completed_at?: string | null
          due_date?: string | null
          due_time?: string | null
          priority?: 'low' | 'medium' | 'high'
          user_id?: string
          tags?: string[]
          voice_created?: boolean | null
          voice_confidence?: number | null
          ai_suggested?: boolean | null
          estimated_duration?: number | null
          actual_duration?: number | null
          category?: string | null
          location?: string | null
          notes?: string | null
          updated_at?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
        }
      }
      reminders: {
        Row: {
          id: string
          task_id: string
          remind_at: string
          created_at: string
          user_id: string
          reminder_type: 'notification' | 'email' | 'sms'
          message: string | null
          sent: boolean | null
        }
        Insert: {
          id?: string
          task_id: string
          remind_at: string
          created_at?: string
          user_id: string
          reminder_type?: 'notification' | 'email' | 'sms'
          message?: string | null
          sent?: boolean | null
        }
        Update: {
          id?: string
          task_id?: string
          remind_at?: string
          created_at?: string
          user_id?: string
          reminder_type?: 'notification' | 'email' | 'sms'
          message?: string | null
          sent?: boolean | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          timezone: string | null
          notification_preferences: Json | null
          theme_preference: 'light' | 'dark' | 'auto'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          notification_preferences?: Json | null
          theme_preference?: 'light' | 'dark' | 'auto'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          notification_preferences?: Json | null
          theme_preference?: 'light' | 'dark' | 'auto'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          session_type: 'pomodoro' | 'deep_work' | 'break' | 'custom'
          interruptions: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          session_type?: 'pomodoro' | 'deep_work' | 'break' | 'custom'
          interruptions?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          session_type?: 'pomodoro' | 'deep_work' | 'break' | 'custom'
          interruptions?: number | null
          notes?: string | null
          created_at?: string | null
        }
      }
      ai_suggestions: {
        Row: {
          id: string
          user_id: string
          suggestion_type: 'task' | 'optimization' | 'insight' | 'reminder'
          title: string
          description: string | null
          metadata: Json | null
          accepted: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          suggestion_type: 'task' | 'optimization' | 'insight' | 'reminder'
          title: string
          description?: string | null
          metadata?: Json | null
          accepted?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          suggestion_type?: 'task' | 'optimization' | 'insight' | 'reminder'
          title?: string
          description?: string | null
          metadata?: Json | null
          accepted?: boolean | null
          created_at?: string | null
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          date: string
          tasks_created: number
          tasks_completed: number
          voice_tasks_created: number
          focus_minutes: number
          productivity_score: number | null
          mood_rating: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          tasks_created?: number
          tasks_completed?: number
          voice_tasks_created?: number
          focus_minutes?: number
          productivity_score?: number | null
          mood_rating?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          tasks_created?: number
          tasks_completed?: number
          voice_tasks_created?: number
          focus_minutes?: number
          productivity_score?: number | null
          mood_rating?: number | null
          notes?: string | null
          created_at?: string | null
        }
      }
      task_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          icon: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          icon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          icon?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}