import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../../store/taskStore';
import { processTaskWithGPT } from '../../lib/gptService';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onVoiceInputComplete?: (text: string) => void;
  compact?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onVoiceInputComplete, 
  compact = false 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const { addTask } = useTaskStore();

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    setIsListening(true);
    setTranscript('');

    // @ts-ignore - SpeechRecognition isn't in the TS types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      
      setTranscript(transcriptText);
      
      // Auto-stop after getting final result
      if (result.isFinal) {
        setTimeout(() => {
          setIsListening(false);
          if (transcriptText.trim()) {
            stopListening();
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      setIsListening(false);
      toast.error('Error with voice recognition');
    };

    recognition.start();

    return () => {
      recognition.stop();
      setIsListening(false);
    };
  }, [isListening]);

  const stopListening = useCallback(async () => {
    setIsListening(false);
    
    if (transcript.trim()) {
      try {
        setProcessing(true);
        
        // Process with GPT for intelligent tagging
        const processedTask = await processTaskWithGPT(transcript);
        
        if (processedTask) {
          await addTask(processedTask);
          toast.success('Task added successfully!');
          
          if (onVoiceInputComplete) {
            onVoiceInputComplete(transcript);
          }
        }
      } catch (error) {
        console.error('Error processing voice input:', error);
        toast.error('Failed to process task');
      } finally {
        setProcessing(false);
        setTranscript('');
      }
    }
  }, [transcript, addTask, onVoiceInputComplete]);

  useEffect(() => {
    return () => {
      if (isListening) {
        // Cleanup if component unmounts while listening
        setIsListening(false);
      }
    };
  }, [isListening]);

  if (compact) {
    return (
      <motion.button
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-full ${
          isListening
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 animate-pulse'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}
        whileTap={{ scale: 0.95 }}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {processing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isListening ? (
          <Mic className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </motion.button>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        <motion.button
          onClick={isListening ? stopListening : startListening}
          className={`h-16 w-16 rounded-full flex items-center justify-center ${
            isListening
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
          whileTap={{ scale: 0.95 }}
          animate={isListening ? { scale: [1, 1.05, 1] } : {}}
          transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
        >
          {processing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isListening ? (
            <Mic className="h-8 w-8" />
          ) : (
            <MicOff className="h-8 w-8" />
          )}
        </motion.button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isListening 
            ? 'Listening... Say your task' 
            : processing 
              ? 'Processing...' 
              : 'Tap to add task with voice'}
        </p>
        
        {transcript && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 w-full">
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              "{transcript}"
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
              Processing your task...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;