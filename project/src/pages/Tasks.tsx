import { useEffect, useState } from 'react';
import { Filter, Plus } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import TaskQuickAdd from '../components/tasks/TaskQuickAdd';
import TaskSummary from '../components/tasks/TaskSummary';
import VoiceInput from '../components/voice/VoiceInput';
import { motion } from 'framer-motion';

const Tasks = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filter === 'active' && task.completed_at) return false;
    if (filter === 'completed' && !task.completed_at) return false;
    
    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query)) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  const handleVoiceInputComplete = () => {
    setShowVoiceInput(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and track your progress
          </p>
        </div>
        
        <div className="flex gap-2">
          <TaskQuickAdd />
        </div>
      </div>
      
      {/* Voice input dialog */}
      {showVoiceInput && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowVoiceInput(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Add Task with Voice</h2>
            <VoiceInput onVoiceInputComplete={handleVoiceInputComplete} />
          </div>
        </motion.div>
      )}
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
          
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input max-w-xs"
            >
              <option value="all">All Tasks</option>
              <option value="active">Active Tasks</option>
              <option value="completed">Completed Tasks</option>
            </select>
          </div>
          
          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="input max-w-xs"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Task list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {filter === 'active' ? 'Active Tasks' : 
             filter === 'completed' ? 'Completed Tasks' : 'All Tasks'}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({filteredTasks.length})
            </span>
          </h2>
          
          <button
            onClick={() => setShowVoiceInput(true)}
            className="p-2 rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50"
            aria-label="Add task with voice"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskSummary key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
            <button
              onClick={() => setShowVoiceInput(true)}
              className="mt-4 btn-primary"
            >
              <Plus className="h-5 w-5 mr-1" />
              Add Task with Voice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;