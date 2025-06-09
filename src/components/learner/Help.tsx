
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

    // Mock ticket submission
    toast({
      title: "Ticket Submitted",
      description: "Your support ticket has been created. We'll respond within 24 hours.",
    });

    setSubject('');
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
      question: "How long do I have to complete my courses?",
      answer: "Each course has a due date shown on the course card. You can see all due dates in your course overview. Extensions may be available through your manager."
    },
    {
      question: "Can I retake a course or quiz?",
      answer: "Yes, you can retake most courses and quizzes. Look for the 'Retake' option on completed courses or contact support for assistance."
    },
    {
      question: "Who can I contact for urgent issues?",
      answer: "For urgent technical issues, use the live chat feature below or submit a high-priority support ticket. For course content questions, contact your learning administrator."
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
              <CardDescription>Chat directly with our support team for immediate assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chat Messages Area */}
                <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-muted/20">
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-xs">
                        <p className="text-sm">Hello! How can I help you today?</p>
                        <p className="text-xs opacity-70">Support Team • Just now</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Type your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && setMessage('')}
                  />
                  <Button size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Our support team is available Monday-Friday, 9 AM - 5 PM EST
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
