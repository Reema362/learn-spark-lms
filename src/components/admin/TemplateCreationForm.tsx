
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from 'lucide-react';

interface TemplateCreationFormProps {
  onSubmit: (template: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: any;
}

const TemplateCreationForm = ({ onSubmit, onCancel, isLoading, initialData }: TemplateCreationFormProps) => {
  const [template, setTemplate] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'email',
    subject: initialData?.subject || '',
    content: initialData?.content || '',
    variables: initialData?.variables || [],
    is_active: initialData?.is_active !== false
  });

  const [newVariable, setNewVariable] = useState({ name: '', description: '' });

  const templateCategories = {
    'course-assignment': 'Course Assignment',
    'course-completion': 'Course Completion', 
    'course-reminder': 'Course Reminder',
    'course-quiz-failure': 'Course Quiz Failure',
    'manager-reminder': 'Manager Reminder',
    'course-certification': 'Course Certification',
    'custom': 'Custom'
  };

  const addVariable = () => {
    if (newVariable.name.trim()) {
      setTemplate(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({ name: '', description: '' });
    }
  };

  const removeVariable = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(template);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={template.name}
            onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select value={template.type} onValueChange={(value: any) => setTemplate(prev => ({ ...prev, type: value }))}>
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
          
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={template.subject}
              onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject"
              disabled={template.type !== 'email'}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={template.content}
            onChange={(e) => setTemplate(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Template content (supports HTML and variables like {{user_name}})"
            rows={8}
            required
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Variables</CardTitle>
            <CardDescription>
              Define variables that can be used in your template content using {{variable_name}}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Variable name"
                value={newVariable.name}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={newVariable.description}
                onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
              />
              <Button type="button" onClick={addVariable} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {template.variables.map((variable: any, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {variable.name}
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update Template' : 'Create Template')}
        </Button>
      </div>
    </form>
  );
};

export default TemplateCreationForm;
