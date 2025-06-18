
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Volume2, VolumeX, Mic, MicOff, Pause, Play, Square } from 'lucide-react';

interface AvoBotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AvoBot: React.FC<AvoBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Avo Bot, your intelligent AI assistant for the Learning Management System. I can help you with LMS tasks like uploading content, managing courses, playing videos, and understanding platform features. You can chat with me or use voice input. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsRecording(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          handleVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
      };
    }
  }, []);

  const speak = (text: string) => {
    if (speechEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Find a female voice
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('alice') ||
        voice.name.toLowerCase().includes('emma') ||
        voice.name.toLowerCase().includes('aria') ||
        voice.name.toLowerCase().includes('sarah') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('fiona') ||
        (voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('us-en'))
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const pauseSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const resumeSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: transcript,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      processMessage(transcript, true);
    }
  };

  const getLMSResponse = (userMessage: string, isVoice: boolean = false): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // LMS-related responses
    if (lowerMessage.includes('upload') && lowerMessage.includes('video')) {
      return isVoice 
        ? "To upload a video, go to Course Management in the admin panel, click Create Course or edit existing, then select Upload Video and choose your file. Wait for upload to complete and save."
        : "To upload a video: 1) Go to Course Management in the admin panel, 2) Click 'Create Course' or edit an existing course, 3) In the course form, look for the 'Upload Video' section, 4) Select your video file (MP4 recommended), 5) Wait for upload to complete, 6) Save your course. The video will be stored securely in our system.";
    } else if (lowerMessage.includes('publish') && (lowerMessage.includes('course') || lowerMessage.includes('draft'))) {
      return isVoice
        ? "To publish a course, go to Course Management, find your draft, click Edit, change status to Published, then save changes."
        : "To publish a course: 1) Navigate to Course Management, 2) Find your draft course, 3) Click the 'Edit' button, 4) Change the status from 'Draft' to 'Published', 5) Click 'Save Changes'. Published courses will be visible to learners immediately.";
    } else if (lowerMessage.includes('video') && (lowerMessage.includes('not playing') || lowerMessage.includes('won\'t play'))) {
      return isVoice
        ? "If videos won't play, check your internet connection, refresh the page, and make sure you're using Chrome, Firefox, or Safari. Try clearing your browser cache if needed."
        : "If videos aren't playing: 1) Check your internet connection, 2) Try refreshing the page, 3) Ensure you're using a supported browser (Chrome, Firefox, Safari), 4) Clear your browser cache, 5) If the issue persists, the video might still be processing - wait a few minutes and try again.";
    } else if (lowerMessage.includes('courses') && (lowerMessage.includes('see') || lowerMessage.includes('view') || lowerMessage.includes('available'))) {
      return isVoice
        ? "For your courses, admins can check Course Management in the dashboard. Learners should visit My Courses to see enrolled courses and track progress."
        : "To view your courses: For Admins - Go to 'Course Management' in the admin dashboard to see all courses you've created. For Learners - Visit 'My Courses' in the learner dashboard to see enrolled courses and track your progress.";
    } else if (lowerMessage.includes('reset password') || lowerMessage.includes('forgot password')) {
      return isVoice
        ? "To reset your password, go to the login page, click Forgot Password, enter your email, and follow the instructions sent to your email."
        : "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password?', 3) Enter your email address, 4) Check your email for reset instructions, 5) Follow the link in the email to create a new password. Contact support if you don't receive the email.";
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('completion')) {
      return isVoice
        ? "Check course progress in My Courses section. Each course shows completion percentage. Click on courses for detailed progress tracking."
        : "To check course progress: 1) Go to 'My Courses' in the learner dashboard, 2) Each course shows your completion percentage, 3) Click on a course to see detailed progress, 4) Completed sections are marked with checkmarks. Admins can view all learner progress in the Analytics section.";
    } else if (lowerMessage.includes('navigate') || lowerMessage.includes('how to use')) {
      return isVoice
        ? "Use the sidebar menu to access different sections. Admins have Course Management, User Management, and Analytics. Learners can access My Courses, Certifications, and Help."
        : "Platform navigation tips: Use the sidebar menu to access different sections. Admins have access to Course Management, User Management, and Analytics. Learners can access My Courses, Certifications, and Help. The search function helps you find specific content quickly.";
    }
    
    // General help
    else {
      return isVoice
        ? "I can help with LMS tasks like course management, video uploads, and progress tracking. What would you like to know about?"
        : "I'm here to help with LMS tasks! I can assist you with uploading videos, publishing courses, checking progress, navigating the platform, and more. What specific area can I help you with today?";
    }
  };

  const processMessage = async (message: string, isVoiceInput: boolean = false) => {
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getLMSResponse(message, isVoiceInput),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Speak response if voice was used for input or if speech is enabled
      if (isVoiceInput || speechEnabled) {
        speak(botResponse.text);
      }
    }, 800 + Math.random() * 800);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    processMessage(messageToProcess, false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col fixed right-4 top-1/2 transform -translate-y-1/2 translate-x-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Avo Bot - LMS Assistant
          </DialogTitle>
          <DialogDescription>
            Your intelligent AI assistant for Learning Management System
          </DialogDescription>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className="flex items-center gap-2"
            >
              {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {speechEnabled ? 'Voice On' : 'Voice Off'}
            </Button>
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className="flex items-center gap-2"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'Stop' : 'Voice'}
            </Button>
            {isSpeaking && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPaused ? resumeSpeech : pauseSpeech}
                  className="flex items-center gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeech}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 mt-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about LMS tasks or use voice input..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvoBot;
