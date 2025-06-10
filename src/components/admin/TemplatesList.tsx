
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, MessageSquare, Bell, FileText, Copy } from 'lucide-react';

interface TemplatesListProps {
  templates: any[];
  onEdit: (template: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: any) => void;
}

const TemplatesList = ({ templates, onEdit, onDelete, onDuplicate }: TemplatesListProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'alert':
      case 'notification':
        return <Bell className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTemplateCategory = (name: string) => {
    if (name.toLowerCase().includes('course assignment') || name.toLowerCase().includes('send course')) {
      return 'Course Assignment';
    }
    if (name.toLowerCase().includes('course completion')) {
      return 'Course Completion';
    }
    if (name.toLowerCase().includes('course reminder')) {
      return 'Course Reminder';
    }
    if (name.toLowerCase().includes('quiz failure')) {
      return 'Course Quiz Failure';
    }
    if (name.toLowerCase().includes('manager reminder')) {
      return 'Manager Reminder';
    }
    if (name.toLowerCase().includes('certification')) {
      return 'Course Certification';
    }
    return 'Custom';
  };

  const isDefaultTemplate = (name: string) => {
    return name.toLowerCase().startsWith('default');
  };

  return (
    <div className="space-y-4">
      {templates.map((template: any) => (
        <Card key={template.id} className="relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <CardTitle className="text-lg">
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary" className="opacity-80">
                    {getTypeIcon(template.type)}
                    {template.type}
                  </Badge>
                  <Badge variant="outline">
                    {getTemplateCategory(template.name)}
                  </Badge>
                  {isDefaultTemplate(template.name) && (
                    <Badge variant="default">
                      Default
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {template.subject || 'No Subject'}
                </CardDescription>
              </div>
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDuplicate(template)}
                  title="Duplicate template"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(template)}>
                  <Edit className="h-4 w-4" />
                </Button>
                {!isDefaultTemplate(template.name) && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onDelete(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              </div>
              
              {template.variables && template.variables.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 5).map((variable: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {variable.name}
                      </Badge>
                    ))}
                    {template.variables.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-1">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`ml-1 ${template.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TemplatesList;
