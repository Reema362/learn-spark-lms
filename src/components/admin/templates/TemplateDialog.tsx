
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/useDatabase';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
  onSave: () => void;
  title: string;
  description: string;
}

const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onOpenChange,
  template,
  onSave,
  title,
  description
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    is_active: true,
    variables: []
  });

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        type: template.type || 'email',
        subject: template.subject || '',
        content: template.content || '',
        is_active: template.is_active !== undefined ? template.is_active : true,
        variables: template.variables || []
      });
    } else {
      setFormData({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        is_active: true,
        variables: []
      });
    }
  }, [template]);

  const handleSave = async () => {
    try {
      if (template && template.id) {
        await updateTemplate.mutateAsync({
          id: template.id,
          updates: formData
        });
      } else {
        await createTemplate.mutateAsync(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Template Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
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
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter template content"
              rows={6}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createTemplate.isPending || updateTemplate.isPending}>
            {createTemplate.isPending || updateTemplate.isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
