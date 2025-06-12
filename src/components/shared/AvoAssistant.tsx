
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, Send, MessageSquare, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: string;
}

interface AvoAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'learner';
}

const AvoAssistant: React.FC<AvoAssistantProps> = ({ isOpen, onClose, userRole }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm your intelligent AVO Assistant. I can help you with ${userRole === 'admin' ? 'administrative tasks, user management, course creation, and platform analytics' : 'learning paths, course recommendations, progress tracking, and answering questions about security topics'}. What would you like to know?`,
      isUser: false,
      timestamp: new Date(),
      category: 'welcome'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const speakText = async (text: string) => {
    if (!audioEnabled) return;
    
    try {
      // Use Web Speech API with female voice
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      
      // Find a female voice
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.gender === 'female'
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        // Fallback with higher pitch for more feminine sound
        utterance.pitch = 1.3;
      }
      
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response based on user role
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const adminResponses = [
        "I can help you manage users and permissions. Would you like to see analytics or create new content?",
        "For course management, I recommend organizing content by security domains. Need help with that?",
        "Analytics show good engagement rates. Let me help you optimize your training programs.",
        "I can assist with user onboarding, content creation, and platform administration.",
        "Would you like me to help you set up automated campaigns or review user progress?"
      ];
      
      const learnerResponses = [
        "Based on your learning progress, I recommend focusing on data protection fundamentals next.",
        "Great question! This topic relates to our cybersecurity essentials course. Would you like me to explain more?",
        "I can see you're progressing well! Consider taking the advanced security awareness modules.",
        "Let me help you understand this security concept better. Here's a practical example...",
        "Your learning path suggests exploring incident response training. Shall we discuss that?"
      ];
      
      const responses = userRole === 'admin' ? adminResponses : learnerResponses;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
        category: userRole === 'admin' ? 'management' : 'learning'
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the assistant's response with female voice
      speakText(randomResponse);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-[420px] h-[600px] z-50 shadow-2xl border-2 border-accent/30 bg-background/95 backdrop-blur-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-accent to-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">AVO Intelligence</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-sm">
                Advanced AI Assistant for {userRole === 'admin' ? 'Administrators' : 'Learners'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[500px]">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-[85%]">
                  <div
                    className={`p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.category && !message.isUser && (
                        <Badge variant="outline" className="text-xs">
                          {message.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground p-3 rounded-lg border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-muted/30">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me about ${userRole === 'admin' ? 'platform management, analytics, or user administration' : 'courses, security topics, or learning paths'}...`}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="bg-accent hover:bg-accent/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvoAssistant;
