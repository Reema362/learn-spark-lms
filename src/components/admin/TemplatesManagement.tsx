import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, MessageSquare, Plus, Edit, Copy, Trash2 } from 'lucide-react';

const TemplatesManagement = () => {
  const emailTemplates = [
    {
      id: 1,
      name: "Course Assignment Notification",
      type: "course_assignment",
      subject: "New Course Assigned: {{course_name}}",
      description: "Notify learners when a new course is assigned to them",
      lastModified: "2024-01-10",
      usage: "847 sent this month",
      status: "active"
    },
    {
      id: 2,
      name: "Course Completion Congratulations",
      type: "course_completion",
      subject: "Congratulations! You've completed {{course_name}}",
      description: "Celebrate learner achievements upon course completion",
      lastModified: "2024-01-08",
      usage: "234 sent this month",
      status: "active"
    },
    {
      id: 3,
      name: "Course Reminder",
      type: "course_reminder",
      subject: "Reminder: {{course_name}} due in {{days_remaining}} days",
      description: "Remind learners about upcoming course deadlines",
      lastModified: "2024-01-05",
      usage: "156 sent this month",
      status: "active"
    },
    {
      id: 4,
      name: "Certificate Issuance",
      type: "certificate_issued",
      subject: "Your {{certificate_name}} certificate is ready!",
      description: "Notify learners when their certificate is available",
      lastModified: "2024-01-03",
      usage: "89 sent this month",
      status: "active"
    },
    {
      id: 5,
      name: "Escalation Alert",
      type: "escalation",
      subject: "Action Required: {{learner_name}} - Overdue Course",
      description: "Alert managers about overdue courses or issues",
      lastModified: "2023-12-28",
      usage: "23 sent this month",
      status: "draft"
    }
  ];

  const messageTemplates = [
    {
      id: 1,
      name: "Welcome Message",
      type: "welcome",
      description: "Welcome new learners to the platform",
      lastModified: "2024-01-09",
      status: "active"
    },
    {
      id: 2,
      name: "Support Response Template",
      type: "support",
      description: "Standard response for common support queries",
      lastModified: "2024-01-07",
      status: "active"
    },
    {
      id: 3,
      name: "Course Instructions",
      type: "instructions",
      description: "How to navigate and complete courses",
      lastModified: "2024-01-06",
      status: "active"
    }
  ];

  const templateCategories = [
    { name: "Course Assignment", count: 3, icon: FileText, color: "primary" },
    { name: "Completion & Certificates", count: 4, icon: Mail, color: "success" },
    { name: "Reminders & Escalations", count: 5, icon: MessageSquare, color: "warning" },
    { name: "Support & Help", count: 2, icon: MessageSquare, color: "info" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Templates Management</h2>
          <p className="text-muted-foreground">Create and manage email and message templates</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Message Template
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Email Template
          </Button>
        </div>
      </div>

      {/* Template Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {templateCategories.map((category, index) => (
          <Card key={index} className="stats-card cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <category.icon className={`h-8 w-8 mx-auto mb-2 text-${category.color}`} />
              <div className="text-lg font-bold">{category.count}</div>
              <div className="text-sm text-muted-foreground">{category.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Templates */}
        <div className="lg:col-span-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Email Templates
              </CardTitle>
              <CardDescription>Manage automated email notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          {getStatusBadge(template.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2">
                          <strong>Subject:</strong> {template.subject}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Last modified: {new Date(template.lastModified).toLocaleDateString()}
                      </span>
                      <span className="text-success font-medium">{template.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Templates & Quick Actions */}
        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-accent" />
                Message Templates
              </CardTitle>
              <CardDescription>In-app message templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {messageTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          {getStatusBadge(template.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Modified: {new Date(template.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Variables */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>Available variables for personalization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <h4 className="font-medium">User Variables:</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{learner_name}}"}</code>
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{learner_email}}"}</code>
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{manager_name}}"}</code>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium">Course Variables:</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{course_name}}"}</code>
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{due_date}}"}</code>
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{days_remaining}}"}</code>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium">System Variables:</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{platform_name}}"}</code>
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{current_date}}"}</code>
                    <code className="bg-muted/50 px-2 py-1 rounded">{"{{support_email}}"}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common template operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Preview Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplatesManagement;
