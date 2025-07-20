import { useEffect, useState } from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../../store/taskStore';
import { useAnalyticsStore } from '../../store/analyticsStore';

const suggestions = [
  {
    title: "Break down large tasks",
    description: "Try breaking complex tasks into smaller, more manageable sub-tasks for better focus."
  },
  {
    title: "Set deadlines for all tasks",
    description: "Adding due dates helps prioritize your work and improves completion rates."
  },
  {
    title: "Use voice input for quick capture",
    description: "Try the voice input feature to quickly add tasks when you're on the go."
  },
  {
    title: "Review completed tasks",
    description: "Looking at what you've accomplished can boost motivation and productivity."
  },
  {
    title: "Set priorities for important tasks",
    description: "Mark high-priority tasks to ensure you focus on what matters most."
  },
  {
    title: "Use tags for organization",
    description: "Adding tags to your tasks makes them easier to find and organize."
  }
];

const AssistantSuggestions = () => {
  const { tasks } = useTaskStore();
  const { getProductivityScore, getVoiceUsageRate, fetchDailyStats } = useAnalyticsStore();
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [customSuggestions, setCustomSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    fetchDailyStats();
    
    // Change suggestion every 15 seconds
    const interval = setInterval(() => {
      setCurrentSuggestion(prev => (prev + 1) % suggestions.length);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [fetchDailyStats]);
  
  useEffect(() => {
    // Generate contextual suggestions based on user data
    const newSuggestions = [];
    
    // Check for tasks without due dates
    const tasksWithoutDueDate = tasks.filter(task => !task.completed_at && !task.due_date);
    if (tasksWithoutDueDate.length > 3) {
      newSuggestions.push("You have several tasks without due dates. Adding deadlines can help you prioritize better.");
    }
    
    // Check for voice usage
    const voiceUsage = getVoiceUsageRate();
    if (voiceUsage < 20) {
      newSuggestions.push("Try using voice input for quick task creation. It's faster than typing!");
    }
    
    // Check productivity score
    const productivityScore = getProductivityScore();
    if (productivityScore < 50) {
      newSuggestions.push("Your task completion rate is below average. Try focusing on completing existing tasks before adding new ones.");
    }
    
    // Check for high priority tasks
    const highPriorityTasks = tasks.filter(task => !task.completed_at && task.priority === 'high');
    if (highPriorityTasks.length > 5) {
      newSuggestions.push("You have several high-priority tasks. Consider focusing on these before working on lower priority items.");
    }
    
    setCustomSuggestions(newSuggestions);
  }, [tasks, getVoiceUsageRate, getProductivityScore]);
  
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary-500" />
        Assistant Suggestions
      </h2>
      
      <motion.div
        key={currentSuggestion}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="mb-4 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg"
      >
        <h3 className="font-medium text-primary-700 dark:text-primary-300">
          {suggestions[currentSuggestion].title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {suggestions[currentSuggestion].description}
        </p>
      </motion.div>
      
      {customSuggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Personalized Insights
          </h3>
          
          {customSuggestions.slice(0, 2).map((suggestion, index) => (
            <div 
              key={index}
              className="text-sm p-2 border-l-2 border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 rounded-r-lg"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      <button className="w-full mt-4 flex items-center justify-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
        View all suggestions
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};

export default AssistantSuggestions;