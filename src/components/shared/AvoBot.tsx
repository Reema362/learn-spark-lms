
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
      text: `Hello! I'm Avo Bot, your AI assistant for the AvoCop learning platform. I'm specialized in information security and platform guidance. I'm here to help you with ${userRole === 'admin' ? 'administration tasks, user management, and security best practices' : 'your learning journey, security concepts, and course navigation'}. How can I assist you today?`,
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

    // Information Security Topics
    if (lowerMessage.includes('cia triad') || lowerMessage.includes('confidentiality') || lowerMessage.includes('integrity') || lowerMessage.includes('availability')) {
      return 'The CIA Triad is the foundation of information security:\n\n• **Confidentiality**: Ensuring data is accessible only to authorized users\n• **Integrity**: Maintaining data accuracy and preventing unauthorized modifications\n• **Availability**: Ensuring data and systems are accessible when needed\n\nIn AvoCop, we apply these principles through access controls, data validation, and system monitoring.';
    }

    if (lowerMessage.includes('phishing') || lowerMessage.includes('social engineering')) {
      return 'Phishing and Social Engineering are major security threats:\n\n• **Phishing**: Fraudulent emails/messages to steal credentials\n• **Spear Phishing**: Targeted attacks on specific individuals\n• **Social Engineering**: Manipulating people to divulge information\n\n**Prevention Tips:**\n- Verify sender identity before clicking links\n- Check URLs carefully for misspellings\n- Use multi-factor authentication\n- Report suspicious emails to IT security';
    }

    if (lowerMessage.includes('password') || lowerMessage.includes('authentication')) {
      return 'Password Security Best Practices:\n\n• Use strong, unique passwords (12+ characters)\n• Include uppercase, lowercase, numbers, and symbols\n• Enable Multi-Factor Authentication (MFA)\n• Use password managers\n• Change default passwords immediately\n• Avoid using personal information\n\nIn AvoCop, admin accounts require strong authentication, while learners use SSO for secure access.';
    }

    if (lowerMessage.includes('malware') || lowerMessage.includes('virus') || lowerMessage.includes('ransomware')) {
      return 'Malware Protection Strategies:\n\n• **Types**: Viruses, worms, trojans, ransomware, spyware\n• **Prevention**: Keep software updated, use antivirus, avoid suspicious downloads\n• **Detection**: Monitor system performance, unusual network activity\n• **Response**: Isolate infected systems, restore from backups\n\n**Ransomware Specific:**\n- Regular backups (3-2-1 rule)\n- Network segmentation\n- User awareness training\n- Incident response plan';
    }

    if (lowerMessage.includes('compliance') || lowerMessage.includes('gdpr') || lowerMessage.includes('regulation')) {
      return 'Security Compliance Frameworks:\n\n• **GDPR**: EU data protection regulation\n• **ISO 27001**: Information security management\n• **NIST**: Cybersecurity framework\n• **SOX**: Financial reporting security\n\n**Key Requirements:**\n- Data encryption and access controls\n- Regular security assessments\n- Incident reporting procedures\n- Employee training and awareness\n\nAvoCop helps organizations meet compliance through structured security training.';
    }

    // AvoCop Platform Specific
    if (userRole === 'admin') {
      if (lowerMessage.includes('upload') || lowerMessage.includes('video') || lowerMessage.includes('course upload')) {
        return 'AvoCop Video Upload Guide:\n\n**Supported Formats:** MP4, AVI, MOV, WMV\n**Maximum Size:** 500MB per file\n\n**Upload Steps:**\n1. Go to Course Management > Video Upload\n2. Fill course title and description\n3. Select/create category with color coding\n4. Set duration in minutes\n5. Choose difficulty level\n6. Upload video file and optional thumbnail\n\n**Troubleshooting:**\n- Ensure storage bucket is initialized\n- Check file format compatibility\n- Verify network connection for large files';
      }

      if (lowerMessage.includes('user') || lowerMessage.includes('csv') || lowerMessage.includes('bulk upload')) {
        return 'AvoCop User Management:\n\n**Individual Users:**\n- Add via User Management > Add User\n- Fill email, name, role, department\n\n**Bulk Upload (CSV):**\n- Required: email column\n- Optional: first_name, last_name, department, role\n- Download sample CSV format\n- Users get temporary passwords\n\n**Troubleshooting Upload Errors:**\n- Check CSV format matches requirements\n- Ensure email addresses are valid\n- Verify user permissions for bulk operations';
      }

      if (lowerMessage.includes('category') || lowerMessage.includes('course category')) {
        return 'Course Category Management:\n\n**Creating Categories:**\n- Use color coding for visual organization\n- Choose descriptive names (e.g., "Network Security", "Compliance")\n- Add descriptions for clarity\n\n**Best Practices:**\n- Group related security topics\n- Use consistent naming conventions\n- Assign appropriate colors for quick identification\n- Review and update categories regularly';
      }
    } else {
      if (lowerMessage.includes('course') || lowerMessage.includes('learning') || lowerMessage.includes('training')) {
        return 'AvoCop Learning Features:\n\n**Course Access:**\n- View assigned courses in Courses tab\n- Track progress with visual indicators\n- Access videos, documents, and quizzes\n\n**Progress Tracking:**\n- Green: Completed courses\n- Blue: In progress\n- Gray: Not started\n\n**Interactive Elements:**\n- Video lessons with playback controls\n- Downloadable resources\n- Knowledge assessments\n- Discussion forums for collaboration';
      }

      if (lowerMessage.includes('certificate') || lowerMessage.includes('completion')) {
        return 'AvoCop Certifications:\n\n**Earning Certificates:**\n- Complete all required course modules\n- Pass assessments with minimum score\n- Meet time requirements\n\n**Certificate Features:**\n- PDF download available\n- Digital verification\n- Expiration date tracking\n- Share on professional networks\n\n**Benefits:**\n- Demonstrate security knowledge\n- Career advancement\n- Compliance documentation\n- Continuing education credits';
      }
    }

    // FAQ Topics
    if (lowerMessage.includes('faq') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return 'AvoCop Platform FAQ:\n\n**Q: How do I reset my password?**\nA: Contact your IT administrator for password reset.\n\n**Q: Can I access courses offline?**\nA: Some resources can be downloaded for offline viewing.\n\n**Q: How long do I have to complete courses?**\nA: Check individual course deadlines in your dashboard.\n\n**Q: Technical issues?**\nA: Use Help tab to raise support tickets or contact admin.\n\n**Q: Mobile access?**\nA: AvoCop is responsive and works on mobile devices.';
    }

    // Security Incident Response
    if (lowerMessage.includes('incident') || lowerMessage.includes('breach') || lowerMessage.includes('attack')) {
      return 'Security Incident Response:\n\n**Immediate Steps:**\n1. Contain the threat (isolate systems)\n2. Assess the scope and impact\n3. Notify security team/management\n4. Document all actions taken\n\n**Investigation Phase:**\n- Preserve evidence\n- Identify attack vectors\n- Determine data/systems affected\n\n**Recovery:**\n- Remove malicious elements\n- Restore from clean backups\n- Apply security patches\n- Monitor for persistence\n\n**Post-Incident:**\n- Conduct lessons learned session\n- Update security procedures\n- Provide additional training';
    }

    // General responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello! I'm here to assist you with information security topics and AvoCop platform guidance. As ${userRole === 'admin' ? 'an administrator' : 'a learner'}, I can help you with security concepts, platform features, and best practices. What would you like to know?`;
    }

    if (lowerMessage.includes('security') && !lowerMessage.includes('password') && !lowerMessage.includes('malware')) {
      return 'Information Security encompasses multiple domains:\n\n• **Network Security**: Firewalls, IDS/IPS, VPNs\n• **Application Security**: Secure coding, testing, validation\n• **Data Security**: Encryption, classification, DLP\n• **Identity Management**: Authentication, authorization, access control\n• **Risk Management**: Assessment, mitigation, monitoring\n• **Incident Response**: Detection, containment, recovery\n\nAvoCop provides comprehensive training in all these areas. What specific topic interests you?';
    }

    // Default response
    return `I understand you're asking about: "${userMessage}". I'm specialized in information security and AvoCop platform guidance. I can help with:\n\n• Security concepts (CIA Triad, threats, controls)\n• AvoCop features (courses, uploads, user management)\n• Best practices and compliance\n• Platform troubleshooting\n\nCould you please be more specific about what you'd like to learn?`;
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
                placeholder="Ask about security or AvoCop features..."
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
