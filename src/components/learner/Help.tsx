import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, HelpCircle, FileText, Clock, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [ticketType, setTicketType] = useState('technical');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: "support", time: "Just now" }
  ]);
  const { toast } = useToast();

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Ticket Submitted",
      description: "Your support ticket has been created. We'll respond within 24 hours.",
    });

    setSubject('');
    setMessage('');
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = { 
      id: chatMessages.length + 1, 
      text: message, 
      sender: "user", 
      time: "Just now" 
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Generate AI response based on message content
    const generateResponse = (userMsg: string) => {
      const lowerMsg = userMsg.toLowerCase();
      
      if (lowerMsg.includes('course') || lowerMsg.includes('video') || lowerMsg.includes('lesson')) {
        return "I can help you with course-related issues! You can find your assigned courses in the 'My Courses' section. If you're having trouble accessing a video or lesson, try refreshing the page or clearing your browser cache.";
      } else if (lowerMsg.includes('certificate') || lowerMsg.includes('certification')) {
        return "Certificates are available in the 'Certifications' tab once you complete a course with a passing grade. It may take up to 24 hours for certificates to appear. Would you like me to check the status of a specific course?";
      } else if (lowerMsg.includes('password') || lowerMsg.includes('login') || lowerMsg.includes('access')) {
        return "For password or login issues, please contact your system administrator. If you're a learner, you typically don't need a password - just enter your email address to access the platform.";
      } else if (lowerMsg.includes('game') || lowerMsg.includes('gamification') || lowerMsg.includes('badge')) {
        return "Great question about our gamification features! You can access security games in the 'Gamification' section. Complete games to earn badges and points. Your progress is tracked on the leaderboard!";
      } else if (lowerMsg.includes('mobile') || lowerMsg.includes('phone') || lowerMsg.includes('tablet')) {
        return "Yes! AvoCop is fully mobile-responsive. You can access all courses, games, and features from your mobile device or tablet through your web browser.";
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('help')) {
        return "Hello! I'm here to assist you with the AvoCop learning platform. I can help with course access, certificates, gamification features, technical issues, and general platform questions. What specific area would you like help with?";
      } else {
        return `I understand you're asking about "${userMsg}". I'm here to help with course access, certificates, gamification, and technical issues. Could you please provide more details about your specific question or problem?`;
      }
    };

    // Add AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        text: generateResponse(message),
        sender: "support",
        time: "Just now"
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setMessage('');
  };

  const myTickets = [
    {
      id: "TKT-001",
      subject: "Unable to access video content",
      status: "open",
      priority: "medium",
      created: "2024-01-12",
      lastUpdate: "2024-01-12",
      responses: 2
    },
    {
      id: "TKT-002",
      subject: "Quiz not submitting properly",
      status: "in-progress",
      priority: "high",
      created: "2024-01-10",
      lastUpdate: "2024-01-11",
      responses: 3
    },
    {
      id: "TKT-003",
      subject: "Certificate download issue",
      status: "resolved",
      priority: "low",
      created: "2024-01-08",
      lastUpdate: "2024-01-09",
      responses: 1
    }
  ];

  const faqItems = [
    {
      question: "How do I access my assigned courses?",
      answer: "You can find all your assigned courses in the 'My Courses' section. Click on any course to start or continue your learning."
    },
    {
      question: "I can't see my certificate after completing a course. What should I do?",
      answer: "Certificates are usually available within 24 hours of course completion. Check the 'Certifications' tab. If it's still not there, please submit a support ticket."
    },
    {
      question: "How do I play security games and earn badges?",
      answer: "Visit the 'Gamification' section to access interactive security games. Complete games with passing scores to earn badges and climb the leaderboard!"
    },
    {
      question: "Can I access AvoCop on my mobile device?",
      answer: "Yes! AvoCop is fully responsive and works on all mobile devices and tablets through your web browser."
    },
    {
      question: "How long do I have to complete my courses?",
      answer: "Each course has a due date shown on the course card. You can see all due dates in your course overview. Extensions may be available through your manager."
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-info text-info-foreground">Open</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-warning text-warning-foreground">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-success text-success-foreground">Resolved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Help & Support</h2>
        <p className="text-muted-foreground">Get assistance with your learning experience</p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="ticket">Submit Ticket</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Live Chat */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Live Chat Support
              </CardTitle>
              <CardDescription>Chat with our AI support assistant for immediate assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat Messages Area */}
                <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-muted/20">
                  <div className="space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-xs ${
                          msg.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-background border'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.sender === 'user' ? 'You' : 'Support'} • {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Type your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Ask about courses, certificates, gamification, or any technical issues!
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Ticket */}
        <TabsContent value="ticket" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
              <CardDescription>Create a detailed support request for complex issues</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Issue Type</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="course-content">Course Content</option>
                      <option value="certification">Certification</option>
                      <option value="gamification">Gamification</option>
                      <option value="account">Account Related</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <Input 
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea 
                    placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets */}
        <TabsContent value="tickets" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>Track the status of your submitted tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">Ticket ID: {ticket.id}</p>
                      </div>
                      <div className="flex space-x-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Created: {new Date(ticket.created).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{ticket.responses} responses</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      {ticket.status !== 'resolved' && (
                        <Button size="sm" variant="outline">Add Response</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions and their answers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
