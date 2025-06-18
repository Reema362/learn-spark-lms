import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Volume2, VolumeX, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AvoBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const AvoBot: React.FC<AvoBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Avo Bot, your AI security assistant. I can help you with information security topics, phishing awareness, compliance training, and answer questions about your learning platform. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Check for speech recognition support with proper type checking
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: "Could not process your voice input. Please try typing instead.",
            variant: "destructive",
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAvoResponse = (userInput: string): string => {
    const input = userInput.toLowerCase().trim();
    
    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(input)) {
      return "Hello! I'm Avo Bot, your cybersecurity assistant. I'm here to help you with information security topics, training questions, and platform guidance. What would you like to know?";
    }
    
    // Farewells
    if (/^(bye|goodbye|see you|thanks|thank you|that's all)/.test(input)) {
      return "You're welcome! Stay safe and secure online. Feel free to ask me anything anytime you need help with cybersecurity or your learning platform!";
    }

    // Phishing-related questions
    if (input.includes('phishing') || input.includes('phish') || input.includes('suspicious email')) {
      return "🎣 Phishing is a cybersecurity threat where attackers impersonate legitimate organizations to steal sensitive information. Here are key warning signs:\n\n• Urgent or threatening language\n• Suspicious sender addresses\n• Generic greetings like 'Dear Customer'\n• Requests for personal information\n• Suspicious links or attachments\n\nAlways verify the sender through official channels before clicking links or providing information. When in doubt, report it to your IT security team!";
    }

    // Social engineering
    if (input.includes('social engineering')) {
      return "🕵️ Social engineering involves manipulating people to divulge confidential information or perform actions that compromise security. Common tactics include:\n\n• Pretexting (creating fake scenarios)\n• Baiting (offering something enticing)\n• Tailgating (following someone into secure areas)\n• Quid pro quo (offering help in exchange for information)\n\nAlways verify identities, be skeptical of unsolicited contact, and follow your organization's security protocols!";
    }

    // Password security
    if (input.includes('password') || input.includes('passphrase')) {
      return "🔐 Strong password security is crucial! Best practices include:\n\n• Use unique, complex passwords for each account\n• Enable two-factor authentication (2FA) whenever possible\n• Consider using a password manager\n• Use passphrases with 12+ characters\n• Never share passwords or write them down insecurely\n• Change passwords if you suspect they're compromised\n\nRemember: Your password is your first line of defense!";
    }

    // Learning platform help
    if (input.includes('course') || input.includes('training') || input.includes('learn')) {
      return "📚 I can help you navigate your learning platform! Here's what you can do:\n\n• **View Courses** - Browse available security training\n• **Track Progress** - Monitor your learning journey\n• **Take Assessments** - Test your knowledge\n• **Earn Certificates** - Complete courses for recognition\n• **Ask Questions** - Use the help section for support\n\nNeed help with a specific course or feature? Just let me know!";
    }

    // General cybersecurity
    if (input.includes('cyber') || input.includes('security') || input.includes('safe')) {
      return "🔒 Cybersecurity is everyone's responsibility! Key practices:\n\n• Stay informed about current threats\n• Keep software and systems updated\n• Use strong authentication methods\n• Be cautious with email attachments and links\n• Backup important data regularly\n• Report suspicious activities promptly\n• Follow your organization's security policies\n\nRemember: Security is a shared responsibility, and you play a crucial role!";
    }

    // Default response for unrecognized inputs
    return "I understand you're asking about something, but I'd like to provide you with the most accurate information. Could you please rephrase your question or ask about specific topics like:\n\n• Phishing and email security\n• Password protection\n• Data privacy and protection\n• Mobile device security\n• Compliance training\n• Platform navigation\n\nI'm here to help with all your cybersecurity and learning platform questions!";
  };

  const speakText = async (text: string) => {
    if (!synthRef.current || !voiceEnabled) return;

    synthRef.current.cancel();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and prioritize female voices
    const voices = synthRef.current.getVoices();
    const femaleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('susan') ||
      voice.name.toLowerCase().includes('hazel') ||
      voice.name.toLowerCase().includes('samantha')
    );
    
    if (femaleVoices.length > 0) {
      utterance.voice = femaleVoices[0];
    } else {
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
      }
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputText;
    setInputText('');

    setTimeout(() => {
      const response = getAvoResponse(userInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (voiceEnabled) {
        speakText(response);
      }
    }, 500);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Not Available",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-[500px]">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Avo Bot</CardTitle>
              <Badge variant="outline" className="text-xs">Online</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSpeaking}
                className="h-8 w-8"
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-3 min-h-0">
          <ScrollArea className="flex-1 w-full pr-2">
            <div className="space-y-3 pb-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-2'
                        : 'bg-muted mr-2'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex gap-2 mt-3 flex-shrink-0">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me about cybersecurity..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleListening}
              disabled={!recognitionRef.current}
              className={isListening ? 'bg-red-100 text-red-600' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvoBot;
