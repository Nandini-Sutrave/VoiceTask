import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import { CalendarDays, TrendingUp, CheckCircle2, Activity } from 'lucide-react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useTaskStore } from '../store/taskStore';

const Analytics = () => {
  const { dailyStats, fetchDailyStats, getProductivityScore, getCompletionRate, getVoiceUsageRate } = useAnalyticsStore();
  const { tasks } = useTaskStore();
  const [dateRange, setDateRange] = useState<number>(14); // 14 days by default
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'heatmap'>('overview');
  
  useEffect(() => {
    fetchDailyStats(dateRange);
  }, [fetchDailyStats, dateRange]);
  
  // Calculate stats for the charts
  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const priorityPieData = [
    { name: 'High', value: tasksByPriority.high || 0, color: '#ef4444' },
    { name: 'Medium', value: tasksByPriority.medium || 0, color: '#eab308' },
    { name: 'Low', value: tasksByPriority.low || 0, color: '#22c55e' }
  ];
  
  // Create data for heatmap (mock data for demonstration)
  const getDayName = (date: Date): string => {
    return format(date, 'EEE');
  };
  
  const getHeatmapData = () => {
    const today = new Date();
    const data = [];
    
    // Create 10 weeks of data
    for (let week = 9; week >= 0; week--) {
      for (let day = 6; day >= 0; day--) {
        const date = subDays(today, week * 7 + day);
        const dayName = getDayName(date);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Find matching analytics data
        const stat = dailyStats.find(s => s.date === dateStr);
        
        data.push({
          date: dateStr,
          day: dayName,
          week: week,
          value: stat ? stat.tasks_completed : 0,
        });
      }
    }
    
    return data;
  };
  
  const heatmapData = getHeatmapData();
  
  const getHeatmapColor = (value: number) => {
    if (value === 0) return '#f3f4f6';
    if (value === 1) return '#dcfce7';
    if (value <= 3) return '#86efac';
    if (value <= 5) return '#4ade80';
    if (value <= 7) return '#22c55e';
    return '#16a34a';
  };
  
  const formatChartData = () => {
    return dailyStats.map(stat => ({
      date: format(new Date(stat.date), 'MMM d'),
      created: stat.tasks_created,
      completed: stat.tasks_completed,
      voice: stat.voice_tasks_created
    }));
  };
  
  const chartData = formatChartData();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your productivity and task completion rates
        </p>
      </div>
      
      {/* Date range selector */}
      <div className="flex flex-wrap gap-4">
        <div className="card p-4 flex-1 min-w-[250px]">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            Date Range
          </h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="input"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        
        {/* Stats cards */}
        <div className="card p-4 flex-1 min-w-[250px]">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Productivity Score
          </h2>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{getProductivityScore()}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
          </div>
        </div>
        
        <div className="card p-4 flex-1 min-w-[250px]">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Completion Rate
          </h2>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{getCompletionRate()}%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">of tasks</span>
          </div>
        </div>
        
        <div className="card p-4 flex-1 min-w-[250px]">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Voice Usage
          </h2>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{getVoiceUsageRate()}%</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">of tasks</span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Task Analysis
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'heatmap'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Activity Heatmap
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview chart */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Task Activity</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="created" name="Tasks Created" fill="#4f46e5" />
                    <Bar dataKey="completed" name="Tasks Completed" fill="#22c55e" />
                    <Bar dataKey="voice" name="Voice Tasks" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Trend chart */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Productivity Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" name="Tasks Completed" stroke="#22c55e" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="created" name="Tasks Created" stroke="#4f46e5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Task distribution by priority */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Tasks by Priority</h2>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {priorityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Task completion by tag - simple display for now */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Tasks by Tag</h2>
              <div className="flex flex-wrap gap-4">
                {/* Generate tag analytics based on tasks */}
                {Array.from(new Set(tasks.flatMap(t => t.tags))).map(tag => {
                  const tagTasks = tasks.filter(t => t.tags.includes(tag));
                  const completedTagTasks = tagTasks.filter(t => t.completed_at);
                  const completionRate = tagTasks.length 
                    ? Math.round((completedTagTasks.length / tagTasks.length) * 100) 
                    : 0;
                  
                  return (
                    <div key={tag} className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex-1 min-w-[200px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="badge-primary">{tag}</span>
                        <span className="text-sm font-medium">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div 
                          className="bg-primary-600 h-1.5 rounded-full" 
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {completedTagTasks.length} / {tagTasks.length} tasks completed
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            {/* Heatmap */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Activity Heatmap</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Tasks completed per day over the last 10 weeks
              </p>
              
              <div className="flex flex-col items-center">
                <div className="grid grid-cols-7 gap-2">
                  {/* Day labels */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="h-8 flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{day}</span>
                    </div>
                  ))}
                  
                  {/* Heatmap cells */}
                  {heatmapData.map((day, index) => (
                    <div 
                      key={index}
                      className="h-8 w-8 rounded-sm flex items-center justify-center text-xs"
                      style={{ 
                        backgroundColor: getHeatmapColor(day.value),
                        color: day.value > 3 ? 'white' : 'black' 
                      }}
                      title={`${day.date}: ${day.value} tasks completed`}
                    >
                      {day.value > 0 ? day.value : ''}
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-2 mt-6">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
                  {[0, 1, 3, 5, 7].map(value => (
                    <div 
                      key={value}
                      className="h-4 w-4 rounded-sm"
                      style={{ backgroundColor: getHeatmapColor(value) }}
                    ></div>
                  ))}
                  <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
                </div>
              </div>
            </div>
            
            {/* Daily distribution */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold mb-4">Daily Activity Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: 'Mon', tasks: dailyStats.filter(s => new Date(s.date).getDay() === 1).reduce((sum, s) => sum + s.tasks_completed, 0) || 5 },
                      { day: 'Tue', tasks: dailyStats.filter(s => new Date(s.date).getDay() === 2).reduce((sum, s) => sum + s.tasks_completed, 0) || 8 },
                      { day: 'Wed', tasks: dailyStats.filter(s => new Date(s.date).getDay() === 3).reduce((sum, s) => sum + s.tasks_completed, 0) || 12 },
                      { day: 'Thu', tasks: dailyStats.filter(s => new Date(s.date).getDay() === 4).reduce((sum, s) => sum + s.tasks_completed, 0) || 7 },
                      { day: 'Fri', tasks: dailyStats.filter(s => new Date(s.date).getDay() === 5).reduce((sum, s) => sum + s.tasks_completed, 0) || 9 },
                      { day: 'Sat', tasks: dailyStats.filter(s => new Date(s.date).getDay() === 6).reduce((sum, s) => sum + s.tasks_completed, 0) || 3 },
                      { day: 'Sun', tasks: dailyStats.filter(s => new Date(s.date).getDay() === 0).reduce((sum, s) => sum + s.tasks_completed, 0) || 2 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" name="Tasks Completed" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;