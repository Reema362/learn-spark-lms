
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Clock, Send, Eye, CheckCircle } from 'lucide-react';

const QueriesSupport = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [response, setResponse] = useState('');

  const tickets = [
    {
      id: "TKT-001",
      subject: "Unable to access video content",
      learnerName: "John Smith",
      learnerEmail: "john.smith@company.com",
      status: "open",
      priority: "medium",
      created: "2024-01-12 09:30",
      lastUpdate: "2024-01-12 09:30",
      category: "technical",
      description: "I'm having trouble accessing the video content in the Cybersecurity Fundamentals course. The player shows a loading screen but never loads the video.",
      responses: []
    },
    {
      id: "TKT-002",
      subject: "Quiz not submitting properly",
      learnerName: "Sarah Johnson",
      learnerEmail: "sarah.johnson@company.com",
      status: "in-progress",
      priority: "high",
      created: "2024-01-10 14:15",
      lastUpdate: "2024-01-11 10:20",
      category: "technical",
      description: "When I try to submit my quiz answers, I get an error message and my progress is not saved. This has happened multiple times.",
      responses: [
        {
          from: "support",
          message: "We're investigating this issue. Can you tell me which browser you're using?",
          timestamp: "2024-01-10 15:30"
        },
        {
          from: "learner",
          message: "I'm using Chrome version 120. The issue happens on both my laptop and mobile device.",
          timestamp: "2024-01-11 08:45"
        }
      ]
    },
    {
      id: "TKT-003",
      subject: "Certificate download issue",
      learnerName: "Mike Chen",
      learnerEmail: "mike.chen@company.com",
      status: "resolved",
      priority: "low",
      created: "2024-01-08 16:45",
      lastUpdate: "2024-01-09 11:30",
      category: "certification",
      description: "I completed the Phishing Awareness course but can't download my certificate. The download button doesn't seem to work.",
      responses: [
        {
          from: "support",
          message: "Thank you for reporting this. I've regenerated your certificate. You should now be able to download it from the Certifications tab.",
          timestamp: "2024-01-09 10:15"
        },
        {
          from: "learner",
          message: "Perfect! It's working now. Thank you for the quick resolution.",
          timestamp: "2024-01-09 11:30"
        }
      ]
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

  const handleSendResponse = () => {
    if (!response.trim() || !selectedTicket) return;

    // Mock sending response
    console.log('Sending response:', response);
    setResponse('');
    // In real app, this would update the ticket and refresh the data
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Queries & Support</h2>
          <p className="text-muted-foreground">Manage learner support tickets and queries</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">23</div>
            <div className="text-sm text-muted-foreground">Open Tickets</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-warning">8</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">156</div>
            <div className="text-sm text-muted-foreground">Resolved This Month</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">4.2h</div>
            <div className="text-sm text-muted-foreground">Avg. Response Time</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>All learner support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{ticket.subject}</h4>
                        {getStatusBadge(ticket.status)}
                      </div>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      <p>{ticket.learnerName} • {ticket.id}</p>
                      <p>{ticket.created}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-3 w-3" />
                        <span>{ticket.responses.length} responses</span>
                      </div>
                      {ticket.status !== 'resolved' && (
                        <div className="flex items-center space-x-1 text-warning">
                          <Clock className="h-3 w-3" />
                          <span>Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details and Chat */}
        <div className="lg:col-span-3">
          {selectedTicket ? (
            <Card className="dashboard-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedTicket.subject}</span>
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </CardTitle>
                    <CardDescription>
                      {selectedTicket.learnerName} • {selectedTicket.learnerEmail} • {selectedTicket.id}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {selectedTicket.status !== 'resolved' && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original Message */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">{selectedTicket.learnerName}</span>
                    <span className="text-xs text-muted-foreground">{selectedTicket.created}</span>
                  </div>
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>

                {/* Conversation */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedTicket.responses.map((response: any, index: number) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-3 ${
                        response.from === 'support' ? 'bg-primary/5 ml-8' : 'bg-muted/20 mr-8'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">
                          {response.from === 'support' ? 'Support Team' : selectedTicket.learnerName}
                        </span>
                        <span className="text-xs text-muted-foreground">{response.timestamp}</span>
                      </div>
                      <p className="text-sm">{response.message}</p>
                    </div>
                  ))}
                </div>

                {/* Response Form */}
                {selectedTicket.status !== 'resolved' && (
                  <div className="border-t pt-4 space-y-3">
                    <Textarea
                      placeholder="Type your response here..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Add Internal Note
                        </Button>
                        <Button variant="outline" size="sm">
                          Escalate
                        </Button>
                      </div>
                      <Button onClick={handleSendResponse} disabled={!response.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="dashboard-card">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Select a Ticket</h3>
                <p className="text-sm text-muted-foreground">Choose a support ticket from the list to view details and respond</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueriesSupport;
