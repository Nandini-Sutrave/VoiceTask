import { supabase } from './supabase';
import { Task } from '../types/task';

// Enhanced GPT processing function that works with your current schema
export const processTaskWithGPT = async (taskDescription: string): Promise<Partial<Task>> => {
  try {
    // Extract due date using regex patterns
    const dueDatePatterns = [
      /(?:by|due|on)\s+(tomorrow|today|next\s+week|this\s+week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(tomorrow|today|next\s+week|this\s+week)/i,
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
      /(\d{1,2}-\d{1,2}-\d{2,4})/i
    ];
    
    // Extract time patterns
    const timePatterns = [
      /at\s(\d{1,2}):(\d{2})\s?(am|pm)/i,
      /at\s(\d{1,2})\s?(am|pm)/i,
      /(\d{1,2}):(\d{2})\s?(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
      /(\d{1,2}):(\d{2})/i
    ];
    
    let dueDate: Date | null = null;
    let dueTime: string | null = null;
    let matchedText = '';
    
    // Process date
    for (const pattern of dueDatePatterns) {
      const match = taskDescription.match(pattern);
      if (match && match[1]) {
        matchedText = match[1].toLowerCase().replace(/\s+/g, ' ');
        const now = new Date();
        
        if (matchedText === 'today') {
          dueDate = now;
        } else if (matchedText === 'tomorrow') {
          dueDate = new Date(now.setDate(now.getDate() + 1));
        } else if (matchedText === 'next week' || matchedText === 'this week') {
          dueDate = new Date(now.setDate(now.getDate() + 7));
        } else {
          // Handle days of the week
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const dayIndex = days.indexOf(matchedText);
          
          if (dayIndex !== -1) {
            const currentDayIndex = now.getDay();
            let daysUntil = dayIndex - currentDayIndex;
            if (daysUntil <= 0) daysUntil += 7; // Next week if the day has passed
            
            dueDate = new Date(now.setDate(now.getDate() + daysUntil));
          }
        }
        break;
      }
    }
    
    // Process time
    for (const pattern of timePatterns) {
      const match = taskDescription.match(pattern);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3] || match[4] || match[5];
        
        if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) {
          hour += 12;
        } else if (ampm && ampm.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        } else if (!ampm && hour < 8) {
          // Assume PM for times like "2" or "3" (likely afternoon)
          hour += 12;
        }
        
        dueTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        break;
      }
    }
    
    // Extract priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (taskDescription.match(/urgent|asap|immediate|critical|important|high\s+priority|emergency/i)) {
      priority = 'high';
    } else if (taskDescription.match(/sometime|when\s+you\s+can|low\s+priority|later|eventually|no\s+rush/i)) {
      priority = 'low';
    }
    
    // Extract location
    let location: string | null = null;
    const locationPatterns = [
      /at\s([^,\s]+(?:\s+[^,\s]+)*?)(?:\s|,|$)/i,
      /in\s([^,\s]+(?:\s+[^,\s]+)*?)(?:\s|,|$)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = taskDescription.match(pattern);
      if (match && match[1] && !match[1].match(/\d{1,2}:?\d{0,2}\s?(am|pm)/i)) {
        location = match[1].trim();
        break;
      }
    }
    
    // Extract estimated duration (in minutes)
    let estimatedDuration: number | null = null;
    const durationPatterns = [
      /(\d+)\s?hours?/i,
      /(\d+)\s?minutes?/i,
      /(\d+)\s?mins?/i,
      /(\d+)h/i,
      /(\d+)m/i
    ];
    
    for (const pattern of durationPatterns) {
      const match = taskDescription.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        if (pattern.source.includes('hour') || pattern.source.includes('h')) {
          estimatedDuration = value * 60;
        } else {
          estimatedDuration = value;
        }
        break;
      }
    }
    
    // Extract tags based on context
    const tags: string[] = [];
    
    // Work-related tags
    if (taskDescription.match(/work|job|office|meeting|call|email|project|deadline/i)) tags.push('work');
    if (taskDescription.match(/home|house|apartment|family|personal/i)) tags.push('home');
    if (taskDescription.match(/study|school|class|learn|course|homework|assignment/i)) tags.push('study');
    if (taskDescription.match(/meeting|call|conference|zoom|teams/i)) tags.push('meeting');
    if (taskDescription.match(/email|mail|message|reply|respond/i)) tags.push('communication');
    if (taskDescription.match(/buy|purchase|order|shop|store|market/i)) tags.push('shopping');
    if (taskDescription.match(/health|doctor|appointment|exercise|gym|workout/i)) tags.push('health');
    if (taskDescription.match(/travel|trip|vacation|flight|hotel/i)) tags.push('travel');
    if (taskDescription.match(/finance|money|bank|pay|bill|budget/i)) tags.push('finance');
    
    // If no tags were identified, add a default tag
    if (tags.length === 0) tags.push('general');
    
    // Determine category based on tags and content
    let category: string | null = null;
    if (tags.includes('work')) category = 'Work';
    else if (tags.includes('home')) category = 'Personal';
    else if (tags.includes('study')) category = 'Education';
    else if (tags.includes('health')) category = 'Health';
    else if (tags.includes('shopping')) category = 'Shopping';
    else category = 'General';
    
    // Clean up the title by removing time/date/priority indicators
    let title = taskDescription
      .replace(/by\s(tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, '')
      .replace(/due\s(tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, '')
      .replace(/on\s(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, '')
      .replace(/(tomorrow|today|next week)/i, '')
      .replace(/at\s\d{1,2}:?\d{0,2}\s?(am|pm)/i, '')
      .replace(/urgent|asap|immediate|critical/i, '')
      .replace(/sometime|when you can|low priority/i, '')
      .replace(/(\d+)\s?(hours?|minutes?|mins?|h|m)/i, '')
      .trim();
    
    // If the title is too long, truncate it
    if (title.length > 100) {
      title = title.substring(0, 97) + '...';
    }
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return {
      title,
      description: taskDescription,
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
      due_time: dueTime,
      priority,
      tags,
      category,
      location,
      estimated_duration: estimatedDuration,
      voice_created: true,
      voice_confidence: 0.85, // Mock confidence score
      ai_suggested: true,
      status: 'pending',
      user_id: user.id
    };
  } catch (error) {
    console.error('Error in GPT processing:', error);
    throw error;
  }
};

// Function to generate AI suggestions based on user patterns
export const generateAISuggestions = async (): Promise<any[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Get user's recent tasks to analyze patterns
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!recentTasks || recentTasks.length === 0) return [];
    
    const suggestions = [];
    
    // Analyze incomplete tasks
    const incompleteTasks = recentTasks.filter(task => task.status !== 'completed');
    if (incompleteTasks.length > 10) {
      suggestions.push({
        type: 'optimization',
        title: 'Too many open tasks',
        description: 'You have many incomplete tasks. Consider focusing on completing existing ones before adding new tasks.',
        priority: 'high'
      });
    }
    
    // Analyze overdue tasks
    const overdueTasks = incompleteTasks.filter(task => {
      if (!task.due_date) return false;
      return new Date(task.due_date) < new Date();
    });
    
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'reminder',
        title: 'Overdue tasks need attention',
        description: `You have ${overdueTasks.length} overdue tasks. Consider rescheduling or completing them.`,
        priority: 'high'
      });
    }
    
    // Analyze task patterns for productivity insights
    const completedTasks = recentTasks.filter(task => task.status === 'completed');
    const completionRate = completedTasks.length / recentTasks.length;
    
    if (completionRate < 0.5) {
      suggestions.push({
        type: 'insight',
        title: 'Low completion rate',
        description: 'Your task completion rate is below 50%. Try breaking large tasks into smaller, manageable pieces.',
        priority: 'medium'
      });
    }
    
    return suggestions;
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return [];
  }
};