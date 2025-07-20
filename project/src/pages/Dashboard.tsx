import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Play, Brain } from 'lucide-react';
import { format } from 'date-fns';
import TaskQuickAdd from '../components/tasks/TaskQuickAdd';
import TaskSummary from '../components/tasks/TaskSummary';
import AssistantSuggestions from '../components/assistant/AssistantSuggestions';
import FocusTimer from '../components/focus/FocusTimer';
import { Task } from '../types/task';
import { useTaskStore } from '../store/taskStore';
import { useFocusStore } from '../store/focusStore';

const Dashboard = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const { currentSession, fetchSessions } = useFocusStore();
  const [greeting, setGreeting] = useState('');
  const [today] = useState(new Date());
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  
  useEffect(() => {
    fetchTasks();
    fetchSessions();
  }, [fetchTasks, fetchSessions]);
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);
  
  const todayTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate.toDateString() === today.toDateString();
  });
  
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate < today && dueDate.toDateString() !== today.toDateString();
  });
  
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const upcomingTasks = tasks.filter(task => {
    if (task.status === 'completed') return false;
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate > today;
  }).slice(0, 3);
  
  const completedToday = tasks.filter(task => {
    if (task.status !== 'completed' || !task.completed_at) return false;
    const completedDate = new Date(task.completed_at);
    return completedDate.toDateString() === today.toDateString();
  });
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            {greeting}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <TaskQuickAdd />
          <button
            onClick={() => setShowFocusTimer(!showFocusTimer)}
            className={`btn-secondary ${currentSession ? 'animate-pulse' : ''}`}
          >
            <Play className="h-5 w-5 mr-1" />
            {currentSession ? 'Focus Active' : 'Focus Mode'}
          </button>
        </div>
      </div>
      
      {/* Focus Timer */}
      {showFocusTimer && (
        <div className="mb-6">
          <FocusTimer />
        </div>
      )}
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-4 hover:shadow-soft-lg transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Today's Tasks</p>
            <p className="text-2xl font-bold">{todayTasks.length}</p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center gap-4 hover:shadow-soft-lg transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center text-warning-600 dark:text-warning-300">
            <Play className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">In Progress</p>
            <p className="text-2xl font-bold">{inProgressTasks.length}</p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center gap-4 hover:shadow-soft-lg transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-error-100 dark:bg-error-900 flex items-center justify-center text-error-600 dark:text-error-300">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Overdue</p>
            <p className="text-2xl font-bold">{overdueTasks.length}</p>
          </div>
        </div>
        
        <div className="card p-4 flex items-center gap-4 hover:shadow-soft-lg transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center text-success-600 dark:text-success-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Completed Today</p>
            <p className="text-2xl font-bold">{completedToday.length}</p>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks column */}
        <div className="lg:col-span-2 space-y-6">
          {/* In Progress tasks */}
          {inProgressTasks.length > 0 && (
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-warning-500" />
                In Progress
              </h2>
              <div className="space-y-3">
                {inProgressTasks.map(task => (
                  <TaskSummary key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
          
          {/* Today's tasks */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Today's Tasks</h2>
            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <TaskSummary key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No tasks scheduled for today
              </p>
            )}
          </div>
          
          {/* Overdue tasks */}
          {overdueTasks.length > 0 && (
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4 text-error-600 dark:text-error-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Overdue Tasks
              </h2>
              <div className="space-y-3">
                {overdueTasks.map(task => (
                  <TaskSummary key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
          
          {/* Upcoming tasks */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map(task => (
                  <TaskSummary key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No upcoming tasks
              </p>
            )}
          </div>
        </div>
        
        {/* Assistant column */}
        <div className="space-y-6">
          <AssistantSuggestions />
          
          {/* Progress summary */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4">Today's Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tasks Completed</span>
                  <span className="text-sm font-medium">
                    {completedToday.length}/{todayTasks.length + completedToday.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-success-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${todayTasks.length + completedToday.length > 0 
                        ? (completedToday.length / (todayTasks.length + completedToday.length)) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Voice Tasks</span>
                  <span className="text-sm font-medium">
                    {tasks.filter(t => t.voice_created).length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${tasks.length > 0 
                        ? (tasks.filter(t => t.voice_created).length / tasks.length) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">AI Suggested</span>
                  <span className="text-sm font-medium">
                    {tasks.filter(t => t.ai_suggested).length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-secondary-600 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${tasks.length > 0 
                        ? (tasks.filter(t => t.ai_suggested).length / tasks.length) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="card p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-secondary-500" />
              Quick Insights
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">High Priority</span>
                <span className="font-medium text-error-600 dark:text-error-400">
                  {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">With Locations</span>
                <span className="font-medium">
                  {tasks.filter(t => t.location).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Estimated Time</span>
                <span className="font-medium">
                  {tasks.reduce((total, task) => total + (task.estimated_duration || 0), 0)}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;