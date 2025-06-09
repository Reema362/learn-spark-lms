
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AvoBotProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'learner';
}

const AvoBot: React.FC<AvoBotProps> = ({ isOpen, onClose, userRole }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm Avo Bot, your AI assistant for the AvoCop learning platform. I'm here to help you with ${userRole === 'admin' ? 'administration tasks and user management' : 'your learning journey and course navigation'}. How can I assist you today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Admin-specific responses
    if (userRole === 'admin') {
      if (lowerMessage.includes('user') || lowerMessage.includes('add user') || lowerMessage.includes('manage user')) {
        return 'To manage users, go to User Management in your admin panel. You can:\n• Add individual users or bulk upload via CSV\n• Organize users into groups or departments\n• Assign courses to specific users or groups\n• Track user progress and completion rates';
      }
      if (lowerMessage.includes('course') || lowerMessage.includes('create course') || lowerMessage.includes('manage course')) {
        return 'For course management:\n• Navigate to Course Management section\n• Click "Create New Course" to add content\n• Upload videos, documents, images, and create quizzes\n• Set course prerequisites and completion criteria\n• Monitor learner progress in real-time';
      }
      if (lowerMessage.includes('campaign') || lowerMessage.includes('learning campaign')) {
        return 'Learning campaigns help you organize training initiatives:\n• Create campaigns in Campaign Management\n• Assign multiple courses to groups\n• Set deadlines and track progress\n• Generate completion reports\n• Send automated reminders';
      }
      if (lowerMessage.includes('analytics') || lowerMessage.includes('report') || lowerMessage.includes('dashboard')) {
        return 'Analytics provide valuable insights:\n• View the Overview dashboard for key metrics\n• Check learner engagement and completion rates\n• Export detailed reports for analysis\n• Monitor course effectiveness\n• Track time spent on content';
      }
      if (lowerMessage.includes('template') || lowerMessage.includes('email') || lowerMessage.includes('notification')) {
        return 'Template management helps automate communications:\n• Create email templates for course assignments\n• Set up completion congratulation messages\n• Configure reminder notifications\n• Customize escalation alerts\n• Manage certificate notifications';
      }
    } 
    // Learner-specific responses
    else {
      if (lowerMessage.includes('course') || lowerMessage.includes('my course') || lowerMessage.includes('assignment')) {
        return 'Your courses are available in the Courses tab:\n• View all assigned security training courses\n• Track your progress (Not started/In progress/Completed)\n• Access course materials including videos and readings\n• Take quizzes and assessments\n• See completion deadlines';
      }
      if (lowerMessage.includes('certificate') || lowerMessage.includes('certification') || lowerMessage.includes('download')) {
        return 'Certificates are available in the Certifications tab:\n• View all earned certificates\n• Download certificates as PDF files\n• Share your achievements\n• Track certification expiry dates\n• Print certificates for your records';
      }
      if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
        return 'I can help you with support:\n• Raise support tickets in the Help tab\n• Contact administrators directly\n• Get technical assistance\n• Report course content issues\n• Access FAQ and documentation';
      }
      if (lowerMessage.includes('progress') || lowerMessage.includes('completion') || lowerMessage.includes('status')) {
        return 'To track your progress:\n• Check the progress bar on each course\n• View completion percentages\n• See upcoming deadlines\n• Review completed modules\n• Access your learning history';
      }
    }

    // General responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! I'm here to assist you with the AvoCop platform. As ${userRole === 'admin' ? 'an administrator' : 'a learner'}, I can help you navigate the system effectively. What would you like to know?`;
    }
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('where')) {
      return `I can help you with platform navigation and ${userRole === 'admin' ? 'administrative tasks' : 'your learning activities'}. Could you be more specific about what you'd like to do?`;
    }
    if (lowerMessage.includes('logout') || lowerMessage.includes('sign out')) {
      return 'To sign out, click on your profile icon in the sidebar and select "Sign Out". Your progress will be saved automatically.';
    }
    if (lowerMessage.includes('password') || lowerMessage.includes('login') || lowerMessage.includes('account')) {
      return userRole === 'admin' 
        ? 'For admin accounts, use your email and password. Contact your IT administrator for password resets.'
        : 'Learners sign in using SSO (Single Sign-On) with their company email. Contact your IT support for login issues.';
    }

    // Default response
    return 'I understand you\'re asking about: "' + userMessage + '". I\'m here to help with platform navigation, course management, and learning support. Could you please provide more details or rephrase your question?';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span>Avo Bot</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                      message.isUser
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
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={handleKeyPress}
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvoBot;
