
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot } from 'lucide-react';

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
      text: "Hello! I'm AVO Bot, your AI assistant for the Learning Management System. I can help you with LMS tasks like uploading content, managing courses, and understanding platform features. I also provide guidance on information security topics. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const getLMSAndSecurityResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // LMS-related responses
    if (lowerMessage.includes('upload') && lowerMessage.includes('video')) {
      return "To upload a video: 1) Go to Course Management in the admin panel, 2) Click 'Create Course' or edit an existing course, 3) In the course form, look for the 'Upload Video' section, 4) Select your video file (MP4 recommended), 5) Wait for upload to complete, 6) Save your course. The video will be stored securely in our system.";
    } else if (lowerMessage.includes('publish') && (lowerMessage.includes('course') || lowerMessage.includes('draft'))) {
      return "To publish a course: 1) Navigate to Course Management, 2) Find your draft course, 3) Click the 'Edit' button, 4) Change the status from 'Draft' to 'Published', 5) Click 'Save Changes'. Published courses will be visible to learners immediately.";
    } else if (lowerMessage.includes('video') && (lowerMessage.includes('not playing') || lowerMessage.includes('won\'t play'))) {
      return "If videos aren't playing: 1) Check your internet connection, 2) Try refreshing the page, 3) Ensure you're using a supported browser (Chrome, Firefox, Safari), 4) Clear your browser cache, 5) If the issue persists, the video might still be processing - wait a few minutes and try again.";
    } else if (lowerMessage.includes('published courses') || lowerMessage.includes('my courses')) {
      return "To view your courses: For Admins - Go to 'Course Management' in the admin dashboard to see all courses you've created. For Learners - Visit 'My Courses' in the learner dashboard to see enrolled courses and track your progress.";
    } else if (lowerMessage.includes('reset password') || lowerMessage.includes('forgot password')) {
      return "To reset your password: 1) Go to the login page, 2) Click 'Forgot Password?', 3) Enter your email address, 4) Check your email for reset instructions, 5) Follow the link in the email to create a new password. Contact support if you don't receive the email.";
    } else if (lowerMessage.includes('progress') || lowerMessage.includes('completion')) {
      return "To check course progress: 1) Go to 'My Courses' in the learner dashboard, 2) Each course shows your completion percentage, 3) Click on a course to see detailed progress, 4) Completed sections are marked with checkmarks. Admins can view all learner progress in the Analytics section.";
    } else if (lowerMessage.includes('navigate') || lowerMessage.includes('how to use')) {
      return "Platform navigation tips: Use the sidebar menu to access different sections. Admins have access to Course Management, User Management, and Analytics. Learners can access My Courses, Certifications, and Help. The search function helps you find specific content quickly.";
    }
    
    // Security-related responses
    else if (lowerMessage.includes('phishing')) {
      return "Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information like passwords or credit card details. Signs of phishing: suspicious email addresses, urgent language, requests for personal information, suspicious links. Always verify sender authenticity and never click suspicious links.";
    } else if (lowerMessage.includes('social engineering')) {
      return "Social engineering is the psychological manipulation of people to divulge confidential information or perform actions that compromise security. Common tactics include pretexting (creating fake scenarios), baiting (offering something enticing), and tailgating (following someone into secure areas). Always verify identities before sharing information.";
    } else if (lowerMessage.includes('password') && !lowerMessage.includes('reset')) {
      return "Strong password best practices: Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols. Avoid dictionary words and personal information. Use unique passwords for each account. Consider using a password manager to generate and store complex passwords securely.";
    } else if (lowerMessage.includes('malware') || lowerMessage.includes('virus')) {
      return "Malware is malicious software designed to harm computers or steal data. Protection methods: Keep software updated, use reputable antivirus, avoid suspicious downloads, be cautious with email attachments, regularly backup data, and scan USB devices before use.";
    } else if (lowerMessage.includes('wifi') || lowerMessage.includes('network security')) {
      return "WiFi security tips: Use WPA3 encryption, avoid public WiFi for sensitive tasks, use VPN when needed, change default router passwords, disable WPS, and never auto-connect to unknown networks. For sensitive work, prefer wired connections when possible.";
    } else if (lowerMessage.includes('two factor') || lowerMessage.includes('2fa') || lowerMessage.includes('mfa')) {
      return "Two-Factor Authentication (2FA) adds an extra security layer beyond passwords. Enable 2FA on all important accounts using authenticator apps (Google Authenticator, Authy), SMS codes, or hardware keys. This significantly reduces the risk of unauthorized access even if passwords are compromised.";
    }
    
    // General help
    else {
      return "I'm here to help with both LMS tasks and information security! For LMS help, ask about uploading videos, publishing courses, checking progress, or navigating the platform. For security guidance, ask about phishing, passwords, malware, or other cybersecurity topics. What specific area can I assist you with?";
    }
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
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getLMSAndSecurityResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
            <Bot className="h-5 w-5 text-primary" />
            AVO Bot - LMS Chat Assistant
          </DialogTitle>
          <DialogDescription>
            Your AI assistant for Learning Management System and Information Security
          </DialogDescription>
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
              placeholder="Ask me about LMS tasks or security concepts..."
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
