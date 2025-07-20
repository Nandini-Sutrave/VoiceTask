import { useState } from 'react';
import { Plus, Mic, Calendar, Tag, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../../store/taskStore';
import VoiceInput from '../voice/VoiceInput';
import toast from 'react-hot-toast';

const TaskQuickAdd = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  const { addTask } = useTaskStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }
    
    try {
      await addTask({
        title,
        due_date: dueDate || null,
        due_time: dueTime || null,
        priority,
        tags: tags.length > 0 ? tags : ['general']
      });
      
      // Reset form
      setTitle('');
      setDueDate('');
      setDueTime('');
      setPriority('medium');
      setTags([]);
      setShowForm(false);
      
      toast.success('Task added successfully!');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const toggleVoiceInput = () => {
    setShowVoiceInput(!showVoiceInput);
    if (showForm) setShowForm(false);
  };
  
  const handleVoiceInputComplete = () => {
    setShowVoiceInput(false);
  };
  
  if (showVoiceInput) {
    return (
      <div className="w-full max-w-md">
        <VoiceInput onVoiceInputComplete={handleVoiceInputComplete} />
        
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowVoiceInput(false)}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {!showForm ? (
        <div className="flex gap-2">
          <motion.button
            onClick={() => setShowForm(true)}
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Task
          </motion.button>
          
          <motion.button
            onClick={toggleVoiceInput}
            className="btn-ghost bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add task using voice"
          >
            <Mic className="h-5 w-5" />
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="card p-4 border border-gray-200 dark:border-gray-700 shadow-soft-lg w-full max-w-md z-10"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="due_date" className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="h-4 w-4" />
                  Due date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    id="due_date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input"
                    placeholder="Date"
                  />
                  <input
                    type="time"
                    id="due_time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="input"
                    placeholder="Time"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="priority" className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Tag className="h-4 w-4" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span 
                      key={tag} 
                      className="badge-primary flex items-center gap-1"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-primary-800 dark:text-primary-200 hover:text-primary-900 dark:hover:text-primary-100"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="input flex-1"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-ghost border border-gray-300 dark:border-gray-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className="btn-ghost border border-gray-300 dark:border-gray-700"
                    aria-label="Add task using voice"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default TaskQuickAdd;