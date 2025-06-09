
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvoAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'learner';
}

const AvoAssistant: React.FC<AvoAssistantProps> = ({ isOpen, onClose, userRole }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          handleVoiceCommand(transcript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Unable to process voice input. Please try again.",
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    let response = '';

    // Admin-specific commands
    if (userRole === 'admin') {
      if (lowerCommand.includes('dashboard') || lowerCommand.includes('overview')) {
        response = 'I can help you navigate to the dashboard overview. You can view user statistics, course completion rates, and recent activities there.';
      } else if (lowerCommand.includes('user') || lowerCommand.includes('manage users')) {
        response = 'For user management, you can add new users, organize them into groups, and assign courses. Would you like me to guide you through the process?';
      } else if (lowerCommand.includes('course') || lowerCommand.includes('create course')) {
        response = 'I can assist you with course management. You can create new courses, upload content, and track learner progress in the course management section.';
      } else if (lowerCommand.includes('analytics') || lowerCommand.includes('report')) {
        response = 'Analytics and reporting features provide detailed insights into learner performance and engagement metrics. I can help you interpret the data.';
      }
    } 
    // Learner-specific commands
    else {
      if (lowerCommand.includes('course') || lowerCommand.includes('my courses')) {
        response = 'Your assigned courses are displayed in the courses section. I can help you navigate to incomplete courses and track your progress.';
      } else if (lowerCommand.includes('certificate') || lowerCommand.includes('certification')) {
        response = 'Your earned certificates are available in the certifications tab. You can download them as PDF files for your records.';
      } else if (lowerCommand.includes('help') || lowerCommand.includes('support')) {
        response = 'I can assist you with course content or technical issues. You can also raise support tickets in the help section for additional assistance.';
      }
    }

    // General commands
    if (!response) {
      if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
        response = `Hello! I'm Ava, your AI assistant. I'm here to help you navigate the AvoCop learning platform. How can I assist you today?`;
      } else if (lowerCommand.includes('time') || lowerCommand.includes('date')) {
        response = `The current time is ${new Date().toLocaleTimeString()} and today is ${new Date().toLocaleDateString()}.`;
      } else if (lowerCommand.includes('logout') || lowerCommand.includes('sign out')) {
        response = 'To sign out, click on your profile menu in the sidebar and select Sign Out. Your session will be safely terminated.';
      } else {
        response = 'I understand you said: "' + command + '". I\'m here to help with navigation, course management, and platform guidance. Could you please rephrase your request?';
      }
    }

    setResponse(response);
    speakResponse(response);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set female voice
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.gender === 'female'
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      synthesisRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span>Ava Assistant</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              isListening ? 'bg-red-100 animate-pulse' : 
              isSpeaking ? 'bg-green-100 animate-pulse' : 'bg-gray-100'
            }`}>
              {isListening ? (
                <Mic className="h-8 w-8 text-red-500" />
              ) : isSpeaking ? (
                <Volume2 className="h-8 w-8 text-green-500" />
              ) : (
                <Mic className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isListening ? 'Listening...' : 
               isSpeaking ? 'Speaking...' : 
               'Tap to speak with Ava'}
            </p>
          </div>

          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm"><strong>You said:</strong> {transcript}</p>
            </div>
          )}

          {response && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm"><strong>Ava:</strong> {response}</p>
            </div>
          )}

          <div className="flex justify-center space-x-2">
            {!isListening ? (
              <Button onClick={startListening} className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span>Start Listening</span>
              </Button>
            ) : (
              <Button onClick={stopListening} variant="destructive" className="flex items-center space-x-2">
                <MicOff className="h-4 w-4" />
                <span>Stop Listening</span>
              </Button>
            )}

            {isSpeaking && (
              <Button onClick={stopSpeaking} variant="outline" className="flex items-center space-x-2">
                <VolumeX className="h-4 w-4" />
                <span>Stop Speaking</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvoAssistant;
