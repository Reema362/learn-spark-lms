
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Copy, Mail, MessageSquare, Bell, Smartphone } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'alert' | 'notification';
  subject?: string;
  content: string;
  is_active: boolean;
  created_at: string;
  variables: any;
}

interface TemplateTabsContentProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => Promise<void>;
  onDuplicate: (template: Template) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'sms':
      return <Smartphone className="h-4 w-4" />;
    case 'alert':
      return <Bell className="h-4 w-4" />;
    case 'notification':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800';
    case 'sms':
      return 'bg-green-100 text-green-800';
    case 'alert':
      return 'bg-red-100 text-red-800';
    case 'notification':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const TemplateTabsContent: React.FC<TemplateTabsContentProps> = ({
  templates,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2 line-clamp-2">{template.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${getTypeColor(template.type)} flex items-center gap-1`}>
                    {getTypeIcon(template.type)}
                    {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </Badge>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {template.subject && (
              <CardDescription className="mb-2 font-medium">
                Subject: {template.subject}
              </CardDescription>
            )}
            <CardDescription className="mb-4 line-clamp-3">
              {template.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </CardDescription>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(template)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDuplicate(template)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(template.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {templates.length === 0 && (
        <div className="col-span-full text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
