import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Eye, FileText, Mail, MessageSquare, Bell, CheckCheck } from 'lucide-react';
import { useTemplates, useCreateTemplate, useUpdateTemplate } from '@/hooks/useDatabase';

const TemplatesManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'alert' | 'notification',
    subject: '',
    content: '',
    variables: [],
    is_active: true
  });

  const { data: templates, isLoading } = useTemplates();
  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) return;

    try {
      await createTemplateMutation.mutateAsync(newTemplate);
      setIsCreateOpen(false);
      setNewTemplate({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        variables: [],
        is_active: true
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 mr-2" />;
      case 'sms': return <MessageSquare className="h-4 w-4 mr-2" />;
      case 'alert': return <Alert className="h-4 w-4 mr-2" />;
      case 'notification': return <Bell className="h-4 w-4 mr-2" />;
      default: return <FileText className="h-4 w-4 mr-2" />;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading templates...</div>;
  }

  const templatesArray = Array.isArray(templates) ? templates : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Template Management</h2>
          <p className="text-muted-foreground">Create and manage email, SMS, and notification templates</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>Design a new template for emails, SMS, or notifications</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Welcome Email"
                />
              </div>

              <div>
                <Label htmlFor="type">Template Type</Label>
                <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value as 'email' | 'sms' | 'alert' | 'notification' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newTemplate.type === 'email' && (
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Subject line for the email"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Template content here..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="is_active"
                  checked={newTemplate.is_active}
                  onChange={(e) => setNewTemplate({ ...newTemplate, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{templatesArray.length}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success">{templatesArray.filter((t: any) => t.is_active).length}</div>
            <div className="text-sm text-muted-foreground">Active Templates</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">{templatesArray.filter((t: any) => !t.is_active).length}</div>
            <div className="text-sm text-muted-foreground">Inactive Templates</div>
          </CardContent>
        </Card>
      </div>

      {/* Template List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>Manage your email, SMS, and notification templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesArray.map((template: any) => (
              <Card key={template.id} className="template-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      {getStatusBadge(template.is_active)}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      {getTypeIcon(template.type)}
                      {template.type?.toUpperCase()}
                    </div>

                    {template.subject && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Subject:</strong> {template.subject}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.content}
                    </p>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Alert = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-alert-circle"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
};

export default TemplatesManagement;
