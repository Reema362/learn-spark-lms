
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Send, Eye } from 'lucide-react';

const EscalationManagement = () => {
  const escalations = [
    {
      id: "ESC-001",
      type: "overdue-course",
      learnerName: "John Smith",
      learnerEmail: "john.smith@company.com",
      courseName: "Cybersecurity Fundamentals",
      dueDate: "2024-01-10",
      daysPastDue: 3,
      manager: "Sarah Johnson",
      managerEmail: "sarah.johnson@company.com",
      status: "pending",
      created: "2024-01-13",
      priority: "medium"
    },
    {
      id: "ESC-002",
      type: "unresolved-ticket",
      learnerName: "Mike Chen",
      learnerEmail: "mike.chen@company.com",
      ticketId: "TKT-127",
      ticketSubject: "Unable to access course materials",
      daysPending: 5,
      manager: "David Williams",
      managerEmail: "david.williams@company.com",
      status: "escalated",
      created: "2024-01-08",
      priority: "high"
    },
    {
      id: "ESC-003",
      type: "overdue-course",
      learnerName: "Lisa Park",
      learnerEmail: "lisa.park@company.com",
      courseName: "Data Protection and Privacy",
      dueDate: "2024-01-05",
      daysPastDue: 8,
      manager: "Robert Brown",
      managerEmail: "robert.brown@company.com",
      status: "resolved",
      created: "2024-01-06",
      priority: "high"
    }
  ];

  const escalationRules = [
    {
      type: "Overdue Courses",
      trigger: "Course overdue by 3 days",
      action: "Email to reporting manager",
      enabled: true
    },
    {
      type: "Unresolved Tickets",
      trigger: "Support ticket open for 48 hours",
      action: "Escalate to department head",
      enabled: true
    },
    {
      type: "Low Engagement",
      trigger: "No activity for 7 days",
      action: "Send reminder to learner and manager",
      enabled: false
    },
    {
      type: "Failed Assessments",
      trigger: "3 consecutive quiz failures",
      action: "Schedule manager meeting",
      enabled: true
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default" className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'escalated':
        return <Badge variant="destructive">Escalated</Badge>;
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overdue-course':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'unresolved-ticket':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Escalation Management</h2>
          <p className="text-muted-foreground">Manage overdue courses and unresolved issues</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Send Reminders
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-warning">12</div>
            <div className="text-sm text-muted-foreground">Pending Escalations</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-destructive">3</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">47</div>
            <div className="text-sm text-muted-foreground">Resolved This Month</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-info">2.3</div>
            <div className="text-sm text-muted-foreground">Avg. Resolution Days</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Escalations */}
        <div className="lg:col-span-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Active Escalations</CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escalations.map((escalation) => (
                  <div key={escalation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(escalation.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{escalation.learnerName}</h3>
                            {getStatusBadge(escalation.status)}
                            {getPriorityBadge(escalation.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground">{escalation.learnerEmail}</p>
                          <p className="text-xs text-muted-foreground">ID: {escalation.id}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {escalation.status === 'pending' && (
                          <Button size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Escalate
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Escalation Details */}
                    {escalation.type === 'overdue-course' && (
                      <div className="bg-muted/20 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Course:</span>
                          <span className="text-sm">{escalation.courseName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Due Date:</span>
                          <span className="text-sm">{new Date(escalation.dueDate!).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Days Past Due:</span>
                          <span className="text-sm text-destructive font-medium">{escalation.daysPastDue}</span>
                        </div>
                      </div>
                    )}

                    {escalation.type === 'unresolved-ticket' && (
                      <div className="bg-muted/20 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Ticket:</span>
                          <span className="text-sm">{escalation.ticketId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Subject:</span>
                          <span className="text-sm">{escalation.ticketSubject}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Days Pending:</span>
                          <span className="text-sm text-destructive font-medium">{escalation.daysPending}</span>
                        </div>
                      </div>
                    )}

                    {/* Manager Information */}
                    <div className="border-t pt-3">
                      <div className="text-sm">
                        <span className="font-medium">Reporting Manager: </span>
                        <span>{escalation.manager} ({escalation.managerEmail})</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(escalation.created).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Escalation Rules */}
        <div>
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Escalation Rules</CardTitle>
              <CardDescription>Configure automatic escalation triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escalationRules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{rule.type}</h4>
                      <Badge variant={rule.enabled ? "default" : "secondary"} className="text-xs">
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p><strong>Trigger:</strong> {rule.trigger}</p>
                      <p><strong>Action:</strong> {rule.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dashboard-card mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common escalation tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Bulk Reminders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review High Priority
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Overdue Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EscalationManagement;
