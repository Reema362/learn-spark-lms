
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface VoiceAvoAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const VoiceAvoAssistant: React.FC<VoiceAvoAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm AVO Assistant, your voice-enabled AI guide for the Learning Management System. I can help you navigate courses, upload content, and understand security concepts - all hands-free! You can speak to me or type your questions. What can I help you with today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
      
      window.speechSynthesis.speak(utterance);
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
      processMessage(transcript);
    }
  };

  const getLMSAndSecurityVoiceResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // LMS-related voice responses (shorter for voice)
    if (lowerMessage.includes('upload') && lowerMessage.includes('video')) {
      return "To upload a video, go to Course Management, click Create Course or edit existing, then select Upload Video and choose your file. Wait for upload to complete and save.";
    } else if (lowerMessage.includes('publish') && (lowerMessage.includes('course') || lowerMessage.includes('draft'))) {
      return "To publish a course, go to Course Management, find your draft, click Edit, change status to Published, then save changes.";
    } else if (lowerMessage.includes('video') && (lowerMessage.includes('not playing') || lowerMessage.includes('won\'t play'))) {
      return "If videos won't play, check your internet connection, refresh the page, and make sure you're using Chrome, Firefox, or Safari. Try clearing your browser cache if needed.";
    } else if (lowerMessage.includes('available courses') || lowerMessage.includes('my courses')) {
      return "For your courses, admins can check Course Management in the dashboard. Learners should visit My Courses to see enrolled courses and track progress.";
    } else if (lowerMessage.includes('reset password') || lowerMessage.includes('forgot password')) {
      return "To reset your password, go to the login page, click Forgot Password, enter your email, and follow the instructions sent to your email.";
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('completion')) {
      return "Check course progress in My Courses section. Each course shows completion percentage. Click on courses for detailed progress tracking.";
    }
    
    // Security-related voice responses (concise for voice)
    else if (lowerMessage.includes('phishing')) {
      return "Phishing is when criminals fake legitimate messages to steal your information. Watch for suspicious emails, urgent language, and requests for personal data. Always verify the sender first.";
    } else if (lowerMessage.includes('social engineering')) {
      return "Social engineering is psychological manipulation to trick people into sharing confidential information. Common tactics include fake scenarios and following people into secure areas. Always verify identities.";
    } else if (lowerMessage.includes('password') && !lowerMessage.includes('reset')) {
      return "Use strong passwords with at least twelve characters, mixing uppercase, lowercase, numbers, and symbols. Use unique passwords for each account and consider a password manager.";
    } else if (lowerMessage.includes('malware') || lowerMessage.includes('virus')) {
      return "Malware is harmful software. Protect yourself by keeping software updated, using antivirus, avoiding suspicious downloads, and scanning attachments before opening.";
    } else if (lowerMessage.includes('wifi') || lowerMessage.includes('network security')) {
      return "For WiFi security, use WPA3 encryption, avoid public WiFi for sensitive tasks, use VPN when needed, and change default router passwords.";
    } else if (lowerMessage.includes('two factor') || lowerMessage.includes('2fa')) {
      return "Two-factor authentication adds extra security beyond passwords. Enable it on important accounts using authenticator apps, SMS, or hardware keys for better protection.";
    }
    
    // General help
    else {
      return "I can help with LMS tasks like course management, video uploads, and progress tracking. I also provide security guidance on topics like phishing and passwords. What would you like to know about?";
    }
  };

  const processMessage = async (message: string) => {
    setIsTyping(true);

    // Simulate assistant response delay
    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getLMSAndSecurityVoiceResponse(message),
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantResponse]);
      setIsTyping(false);
      speak(assistantResponse.text);
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
    processMessage(messageToProcess);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            AVO Assistant - LMS Voice Guide
          </DialogTitle>
          <DialogDescription>
            Your voice-enabled AI guide for Learning Management System and Security
          </DialogDescription>
          <div className="flex items-center gap-2">
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
              {isRecording ? 'Stop' : 'Voice Input'}
            </Button>
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
              placeholder="Type your message or use voice input for LMS and security help..."
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

export default VoiceAvoAssistant;
