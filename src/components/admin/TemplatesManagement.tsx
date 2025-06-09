
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Copy, Trash2, Eye, Mail, MessageSquare, Bell, FileText } from 'lucide-react';
import { useTemplates, useCreateTemplate, useUpdateTemplate } from '@/hooks/useDatabase';

const TemplatesManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'email',
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
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'alert':
        return <Bell className="h-4 w-4" />;
      case 'notification':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      email: 'bg-blue-50 text-blue-700 border-blue-200',
      sms: 'bg-green-50 text-green-700 border-green-200',
      alert: 'bg-red-50 text-red-700 border-red-200',
      notification: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {type?.toUpperCase()}
      </Badge>
    );
  };

  const sampleTemplates = {
    email: `Subject: Welcome to our Security Training Program

Dear {{firstName}},

We hope this email finds you well. This is a friendly reminder about {{eventName}} scheduled for {{eventDate}}.

Key Details:
- Date: {{eventDate}}
- Time: {{eventTime}}
- Location: {{location}}

Please confirm your attendance by replying to this email.

Best regards,
{{organizationName}} Team`,
    sms: `Hi {{firstName}}, reminder: {{eventName}} on {{eventDate}} at {{eventTime}}. Reply STOP to opt out.`,
    alert: `URGENT: {{alertTitle}}

Description: {{alertDescription}}
Action Required: {{actionRequired}}
Deadline: {{deadline}}

Please take immediate action.`,
    notification: `{{title}}

{{message}}

Click here to view more details: {{actionUrl}}`
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
          <p className="text-muted-foreground">Create and manage communication templates</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>Design a new communication template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Welcome Email Template"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Template Type</Label>
                  <Select 
                    value={newTemplate.type} 
                    onValueChange={(value) => setNewTemplate({ 
                      ...newTemplate, 
                      type: value,
                      content: sampleTemplates[value as keyof typeof sampleTemplates] || '',
                      subject: value === 'email' ? 'Welcome to our Organization' : ''
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {newTemplate.type === 'email' && (
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    placeholder="Enter email subject line"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Enter your template content here..."
                  className="min-h-[300px] font-mono"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Use variables like {`{{firstName}}`}, {`{{eventDate}}`}, {`{{organizationName}}`} in your template
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newTemplate.is_active}
                  onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, is_active: checked })}
                />
                <Label htmlFor="active">Template is active</Label>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="text-2xl font-bold text-info">{templatesArray.filter((t: any) => t.type === 'email').length}</div>
            <div className="text-sm text-muted-foreground">Email Templates</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-accent">{templatesArray.filter((t: any) => t.type === 'sms').length}</div>
            <div className="text-sm text-muted-foreground">SMS Templates</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
          <TabsTrigger value="notification">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>All Templates</CardTitle>
              <CardDescription>Manage your communication templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templatesArray.map((template: any) => (
                  <Card key={template.id} className="template-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(template.type)}
                            <h3 className="font-semibold">{template.name}</h3>
                          </div>
                          {getTypeBadge(template.type)}
                        </div>

                        {template.type === 'email' && template.subject && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Subject:</div>
                            <div className="text-sm font-medium truncate">{template.subject}</div>
                          </div>
                        )}

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Preview:</div>
                          <div className="text-sm text-muted-foreground line-clamp-3">
                            {template.content?.substring(0, 150)}...
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {new Date(template.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setPreviewTemplate(template);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="h-3 w-3 mr-1" />
                            Clone
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {['email', 'sms', 'alert', 'notification'].map((type) => (
          <TabsContent key={type} value={type} className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getTypeIcon(type)}
                  <span className="ml-2">{type.charAt(0).toUpperCase() + type.slice(1)} Templates</span>
                </CardTitle>
                <CardDescription>Manage your {type} templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templatesArray.filter((t: any) => t.type === type).map((template: any) => (
                    <Card key={template.id} className="template-card hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{template.name}</h3>
                            <Badge variant={template.is_active ? "default" : "secondary"}>
                              {template.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          {template.type === 'email' && template.subject && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Subject:</div>
                              <div className="text-sm font-medium truncate">{template.subject}</div>
                            </div>
                          )}

                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Content:</div>
                            <div className="text-sm text-muted-foreground line-clamp-3">
                              {template.content?.substring(0, 150)}...
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {previewTemplate && getTypeIcon(previewTemplate.type)}
              <span className="ml-2">Template Preview: {previewTemplate?.name}</span>
            </DialogTitle>
            <DialogDescription>Preview how this template will appear</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getTypeBadge(previewTemplate.type)}
                <Badge variant={previewTemplate.is_active ? "default" : "secondary"}>
                  {previewTemplate.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              {previewTemplate.type === 'email' && previewTemplate.subject && (
                <div>
                  <Label>Subject Line:</Label>
                  <div className="p-3 bg-muted rounded-md font-medium">
                    {previewTemplate.subject}
                  </div>
                </div>
              )}

              <div>
                <Label>Content:</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
                  {previewTemplate.content}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Created: {new Date(previewTemplate.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesManagement;
