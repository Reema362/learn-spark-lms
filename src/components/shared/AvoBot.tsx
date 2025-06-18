
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Volume2, VolumeX, MessageCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AvoBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Avo, your AI security assistant. I can help you with information security topics, phishing awareness, compliance training, and answer questions about your learning platform. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
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
      return "Hello! I'm Avo, your cybersecurity assistant. I'm here to help you with information security topics, training questions, and platform guidance. What would you like to know?";
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

    // Data protection/privacy
    if (input.includes('data protection') || input.includes('privacy') || input.includes('gdpr')) {
      return "🛡️ Data protection is essential for maintaining privacy and compliance. Key principles:\n\n• Collect only necessary data\n• Secure data with encryption\n• Control access on a need-to-know basis\n• Regular backups and secure disposal\n• Comply with regulations like GDPR, CCPA\n• Report data breaches promptly\n\nAlways handle personal and sensitive data with care and follow your organization's data protection policies!";
    }

    // Incident response
    if (input.includes('incident') || input.includes('breach') || input.includes('attack')) {
      return "🚨 Security incident response is critical! If you suspect a security incident:\n\n1. **Contain** - Isolate affected systems\n2. **Assess** - Determine scope and impact\n3. **Report** - Notify your security team immediately\n4. **Document** - Record all details\n5. **Recover** - Restore systems safely\n6. **Learn** - Conduct post-incident analysis\n\nTime is crucial in incident response - report suspicious activity immediately!";
    }

    // Mobile security
    if (input.includes('mobile') || input.includes('phone') || input.includes('smartphone')) {
      return "📱 Mobile security tips to keep your devices safe:\n\n• Keep OS and apps updated\n• Use device locks (PIN, biometric)\n• Download apps only from official stores\n• Be cautious on public Wi-Fi\n• Enable remote wipe capabilities\n• Use mobile device management (MDM) if required\n• Don't jailbreak or root devices\n\nYour mobile device contains sensitive data - protect it like you would your computer!";
    }

    // Learning platform help
    if (input.includes('course') || input.includes('training') || input.includes('learn')) {
      return "📚 I can help you navigate your learning platform! Here's what you can do:\n\n• **View Courses** - Browse available security training\n• **Track Progress** - Monitor your learning journey\n• **Take Assessments** - Test your knowledge\n• **Earn Certificates** - Complete courses for recognition\n• **Ask Questions** - Use the help section for support\n\nNeed help with a specific course or feature? Just let me know!";
    }

    // Compliance training
    if (input.includes('compliance') || input.includes('regulation') || input.includes('audit')) {
      return "📋 Compliance training ensures adherence to security standards and regulations:\n\n• **Required Training** - Complete mandatory courses on time\n• **Documentation** - Maintain training records\n• **Regular Updates** - Stay current with changing requirements\n• **Assessments** - Demonstrate understanding through tests\n• **Reporting** - Track completion rates and effectiveness\n\nCompliance isn't just about meeting requirements - it's about building a security-conscious culture!";
    }

    // General cybersecurity
    if (input.includes('cyber') || input.includes('security') || input.includes('safe')) {
      return "🔒 Cybersecurity is everyone's responsibility! Key practices:\n\n• Stay informed about current threats\n• Keep software and systems updated\n• Use strong authentication methods\n• Be cautious with email attachments and links\n• Backup important data regularly\n• Report suspicious activities promptly\n• Follow your organization's security policies\n\nRemember: Security is a shared responsibility, and you play a crucial role!";
    }

    // Help/support
    if (input.includes('help') || input.includes('support') || input.includes('how to')) {
      return "🤝 I'm here to help! I can assist you with:\n\n• **Security Topics** - Phishing, passwords, data protection\n• **Platform Navigation** - Courses, assessments, progress tracking\n• **Best Practices** - Cybersecurity tips and guidelines\n• **Compliance** - Training requirements and standards\n• **Incident Response** - What to do if something goes wrong\n\nJust ask me anything related to cybersecurity or your learning platform!";
    }

    // Default response for unrecognized inputs
    return "I understand you're asking about something, but I'd like to provide you with the most accurate information. Could you please rephrase your question or ask about specific topics like:\n\n• Phishing and email security\n• Password protection\n• Data privacy and protection\n• Mobile device security\n• Incident response\n• Compliance training\n• Platform navigation\n\nI'm here to help with all your cybersecurity and learning platform questions!";
  };

  const speakText = async (text: string) => {
    if (!synthRef.current || !voiceEnabled) return;

    synthRef.current.cancel();
    
    // Wait for a moment to ensure cancellation is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and prioritize female voices
    const voices = synthRef.current.getVoices();
    const femaleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('susan') ||
      voice.name.toLowerCase().includes('hazel') ||
      voice.gender === 'female'
    );
    
    if (femaleVoices.length > 0) {
      utterance.voice = femaleVoices[0];
    } else {
      // Fallback to any English voice
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

    // Get Avo's response
    setTimeout(() => {
      const response = getAvoResponse(userInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if voice is enabled
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
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Avo Assistant</CardTitle>
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
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-3">
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-3">
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
                    <p className="whitespace-pre-wrap">{message.text}</p>
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
          
          <div className="flex gap-2 mt-3">
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
