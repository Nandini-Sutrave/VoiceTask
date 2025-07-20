import { useEffect } from 'react';
import { useReminderStore } from '../store/reminderStore';

// Component to manage reminders in the background
const ReminderManager = () => {
  const { fetchReminders, checkReminders } = useReminderStore();
  
  useEffect(() => {
    // Set up notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Fetch reminders on component mount
    fetchReminders();
    
    // Check reminders every minute
    const intervalId = setInterval(() => {
      checkReminders();
    }, 60000); // 60 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchReminders, checkReminders]);
  
  // This component doesn't render anything
  return null;
};

export default ReminderManager;