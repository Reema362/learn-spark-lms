
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileText } from 'lucide-react';
import { getTemplateCategory } from '@/utils/templateUtils';

interface Variable {
  name: string;
  description: string;
}

interface TemplateCreationFormProps {
  onSubmit: (templateData: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: any;
}

const TemplateCreationForm = ({
  onSubmit,
  onCancel,
  isLoading,
  initialData
}: TemplateCreationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'alert' | 'notification',
    subject: '',
    content: '',
    variables: [] as Variable[]
  });

  const [newVariable, setNewVariable] = useState({ name: '', description: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || 'email',
        subject: initialData.subject || '',
        content: initialData.content || '',
        variables: initialData.variables || []
      });
    }
  }, [initialData]);

  const handleAddVariable = () => {
    if (newVariable.name && newVariable.description) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable }]
      }));
      setNewVariable({ name: '', description: '' });
    }
  };

  const handleRemoveVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = getTemplateCategory(formData.name);
    onSubmit({
      ...formData,
      category
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="template-name">Template Name *</Label>
          <Input
            id="template-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Custom Course Assignment"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="template-type">Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
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

        {formData.type === 'email' && (
          <div className="grid gap-2">
            <Label htmlFor="template-subject">Subject *</Label>
            <Input
              id="template-subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject line"
              required
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="template-content">Content *</Label>
          <Textarea
            id="template-content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Template content with variables like {{user_name}}"
            rows={8}
            required
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Template Variables
            </CardTitle>
            <CardDescription>
              Define variables that can be used in your template content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.variables.map((variable, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {variable.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(index)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Variable name (e.g., user_name)"
                value={newVariable.name}
                onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={newVariable.description}
                onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
              />
              <Button type="button" onClick={handleAddVariable} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Variable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};

export default TemplateCreationForm;
