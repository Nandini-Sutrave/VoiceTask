import { useState, useEffect } from 'react';
import { Play, Pause, Square, Coffee, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFocusStore } from '../../store/focusStore';

interface FocusTimerProps {
  taskId?: string;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ taskId }) => {
  const { currentSession, startSession, endSession, addInterruption } = useFocusStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'pomodoro' | 'deep_work' | 'break'>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  
  const sessionDurations = {
    pomodoro: 25 * 60,
    deep_work: 50 * 60,
    break: 5 * 60
  };
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (currentSession) {
        endSession();
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentSession, endSession]);
  
  const handleStart = async () => {
    if (!currentSession) {
      await startSession(taskId, sessionType);
    }
    setIsRunning(true);
  };
  
  const handlePause = () => {
    setIsRunning(false);
  };
  
  const handleStop = async () => {
    setIsRunning(false);
    if (currentSession) {
      await endSession();
    }
    setTimeLeft(sessionDurations[sessionType]);
  };
  
  const handleSessionTypeChange = (type: 'pomodoro' | 'deep_work' | 'break') => {
    if (!isRunning) {
      setSessionType(type);
      setTimeLeft(sessionDurations[type]);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = ((sessionDurations[sessionType] - timeLeft) / sessionDurations[sessionType]) * 100;
  
  return (
    <div className="card p-6 max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Focus Timer</h2>
        
        {/* Session type selector */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => handleSessionTypeChange('pomodoro')}
            className={`px-3 py-1 rounded-full text-sm ${
              sessionType === 'pomodoro'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            disabled={isRunning}
          >
            <Coffee className="h-4 w-4 inline mr-1" />
            Pomodoro
          </button>
          <button
            onClick={() => handleSessionTypeChange('deep_work')}
            className={`px-3 py-1 rounded-full text-sm ${
              sessionType === 'deep_work'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            disabled={isRunning}
          >
            <Zap className="h-4 w-4 inline mr-1" />
            Deep Work
          </button>
          <button
            onClick={() => handleSessionTypeChange('break')}
            className={`px-3 py-1 rounded-full text-sm ${
              sessionType === 'break'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            disabled={isRunning}
          >
            Break
          </button>
        </div>
        
        {/* Timer display */}
        <div className="relative mb-6">
          <svg className="w-32 h-32 mx-auto transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="text-primary-600 transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-mono font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
          {!isRunning ? (
            <motion.button
              onClick={handleStart}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="h-5 w-5" />
              Start
            </motion.button>
          ) : (
            <motion.button
              onClick={handlePause}
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pause className="h-5 w-5" />
              Pause
            </motion.button>
          )}
          
          <motion.button
            onClick={handleStop}
            className="btn-ghost flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Square className="h-5 w-5" />
            Stop
          </motion.button>
        </div>
        
        {/* Interruption counter */}
        {currentSession && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Interruptions: {currentSession.interruptions || 0}
            </p>
            <button
              onClick={addInterruption}
              className="text-xs btn-ghost"
            >
              Add Interruption
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;