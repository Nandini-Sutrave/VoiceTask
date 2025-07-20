import { useState } from 'react';
import { format } from 'date-fns';
import { 
  CheckCircle, Clock, AlertTriangle, MoreVertical, Edit, Trash2, Bell, 
  Play, MapPin, Timer, Brain, Mic 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Task } from '../../types/task';
import { useTaskStore } from '../../store/taskStore';
import { useReminderStore } from '../../store/reminderStore';
import toast from 'react-hot-toast';

interface TaskSummaryProps {
  task: Task;
}

const TaskSummary: React.FC<TaskSummaryProps> = ({ task }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  
  const { toggleTaskCompletion, deleteTask, updateTaskStatus } = useTaskStore();
  const { addReminder } = useReminderStore();
  
  const handleToggleCompletion = () => {
    toggleTaskCompletion(task.id);
  };
  
  const handleStatusChange = (status: 'pending' | 'in_progress' | 'completed') => {
    updateTaskStatus(task.id, status);
    setMenuOpen(false);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
    setMenuOpen(false);
  };
  
  const handleSetReminder = async () => {
    if (!reminderDate || !reminderTime) {
      toast.error('Please select both date and time for the reminder');
      return;
    }
    
    const reminderDateTime = `${reminderDate}T${reminderTime}:00`;
    
    try {
      await addReminder(task.id, reminderDateTime);
      setShowReminderForm(false);
      setReminderDate('');
      setReminderTime('');
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder');
    }
  };
  
  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-error-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'low':
      default:
        return <Clock className="h-4 w-4 text-success-500" />;
    }
  };
  
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'text-success-600 dark:text-success-400';
      case 'in_progress':
        return 'text-warning-600 dark:text-warning-400';
      case 'pending':
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  
  return (
    <motion.div 
      className={`p-4 rounded-lg border transition-all duration-200 ${
        task.status === 'completed'
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          : isOverdue
            ? 'border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } hover:shadow-soft-lg hover:border-primary-200 dark:hover:border-primary-700`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <button
          onClick={handleToggleCompletion}
          className="mt-0.5 flex-shrink-0"
          aria-label={task.status === 'completed' ? "Mark as incomplete" : "Mark as complete"}
        >
          <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${
            task.status === 'completed'
              ? 'bg-success-500 border-success-500 text-white' 
              : task.status === 'in_progress'
                ? 'bg-warning-500 border-warning-500 text-white'
                : 'border-gray-300 dark:border-gray-600'
          }`}>
            {task.status === 'completed' && <CheckCircle className="h-4 w-4" />}
            {task.status === 'in_progress' && <Play className="h-3 w-3" />}
          </div>
        </button>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-medium ${
                task.status === 'completed'
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                {task.title}
                {task.voice_created && (
                  <Mic className="inline h-3 w-3 ml-1 text-primary-500" />
                )}
                {task.ai_suggested && (
                  <Brain className="inline h-3 w-3 ml-1 text-secondary-500" />
                )}
              </h3>
              
              {task.description && (
                <p className={`text-sm mt-1 ${
                  task.status === 'completed'
                    ? 'text-gray-500 dark:text-gray-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Task options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-soft-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Status
                    </div>
                    <button
                      onClick={() => handleStatusChange('pending')}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        task.status === 'pending' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        task.status === 'in_progress' ? 'text-warning-600 dark:text-warning-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full bg-warning-500"></div>
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        task.status === 'completed' ? 'text-success-600 dark:text-success-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full bg-success-500"></div>
                      Completed
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        // Open edit form would go here
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowReminderForm(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Bell className="h-4 w-4" />
                      Set Reminder
                    </button>
                    
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-error-600 dark:text-error-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            {/* Status badge */}
            <span className={`badge ${getStatusColor()}`}>
              {task.status.replace('_', ' ')}
            </span>
            
            {/* Due date */}
            {task.due_date && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-error-600 dark:text-error-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(task.due_date), 'MMM d')}
                  {task.due_time && ` at ${task.due_time}`}
                </span>
              </div>
            )}
            
            {/* Priority */}
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              {getPriorityIcon()}
              <span className="capitalize">{task.priority}</span>
            </div>
            
            {/* Location */}
            {task.location && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                <span>{task.location}</span>
              </div>
            )}
            
            {/* Estimated duration */}
            {task.estimated_duration && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Timer className="h-3 w-3" />
                <span>{task.estimated_duration}m</span>
              </div>
            )}
            
            {/* Category */}
            {task.category && (
              <span className="badge-secondary">
                {task.category}
              </span>
            )}
            
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="badge-primary">
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="badge-accent">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Notes */}
          {task.notes && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
              <strong>Notes:</strong> {task.notes}
            </div>
          )}
        </div>
      </div>
      
      {/* Reminder form */}
      {showReminderForm && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reminder Date
              </label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="input text-sm py-1.5"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="input text-sm py-1.5"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowReminderForm(false)}
                className="text-xs px-3 py-1.5 btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSetReminder}
                className="text-xs px-3 py-1.5 btn-primary"
              >
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TaskSummary;