
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from 'lucide-react';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useDatabase';
import TemplateCreationForm from './TemplateCreationForm';
import TemplatesList from './TemplatesList';

const TemplatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'course-assignment', label: 'Course Assignment' },
    { value: 'course-completion', label: 'Course Completion' },
    { value: 'course-reminder', label: 'Course Reminder' },
    { value: 'course-quiz-failure', label: 'Course Quiz Failure' },
    { value: 'manager-reminder', label: 'Manager Reminder' },
    { value: 'course-certification', label: 'Course Certification' },
    { value: 'custom', label: 'Custom' }
  ];

  const getTemplateCategory = (name: string) => {
    if (name.toLowerCase().includes('course assignment') || name.toLowerCase().includes('send course')) {
      return 'course-assignment';
    }
    if (name.toLowerCase().includes('course completion')) {
      return 'course-completion';
    }
    if (name.toLowerCase().includes('course reminder')) {
      return 'course-reminder';
    }
    if (name.toLowerCase().includes('quiz failure')) {
      return 'course-quiz-failure';
    }
    if (name.toLowerCase().includes('manager reminder')) {
      return 'manager-reminder';
    }
    if (name.toLowerCase().includes('certification')) {
      return 'course-certification';
    }
    return 'custom';
  };

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || getTemplateCategory(template.name) === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const groupedTemplates = categories.slice(1, -1).reduce((acc, category) => {
    acc[category.value] = filteredTemplates.filter(template => 
      getTemplateCategory(template.name) === category.value
    );
    return acc;
  }, {} as Record<string, any[]>);

  const customTemplates = filteredTemplates.filter(template => 
    getTemplateCategory(template.name) === 'custom'
  );

  const handleCreateTemplate = async (templateData: any) => {
    try {
      await createTemplate.mutateAsync(templateData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (templateData: any) => {
    try {
      await updateTemplate.mutateAsync({ 
        id: editingTemplate.id, 
        updates: templateData 
      });
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleDuplicateTemplate = (template: any) => {
    setEditingTemplate({
      ...template,
      id: null,
      name: `Copy of ${template.name}`,
      created_at: null
    });
  };

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Templates Management</h2>
          <p className="text-muted-foreground">Manage and customize templates for course notifications</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates organized by category */}
      <Tabs defaultValue="course-assignment" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="course-assignment">Assignment</TabsTrigger>
          <TabsTrigger value="course-completion">Completion</TabsTrigger>
          <TabsTrigger value="course-reminder">Reminder</TabsTrigger>
          <TabsTrigger value="course-quiz-failure">Quiz Failure</TabsTrigger>
          <TabsTrigger value="manager-reminder">Manager</TabsTrigger>
          <TabsTrigger value="course-certification">Certification</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {categories.slice(1, -1).map(category => (
          <TabsContent key={category.value} value={category.value}>
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>{category.label} Templates</CardTitle>
                <CardDescription>
                  Templates for {category.label.toLowerCase()} notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groupedTemplates[category.value]?.length > 0 ? (
                  <TemplatesList
                    templates={groupedTemplates[category.value]}
                    onEdit={setEditingTemplate}
                    onDelete={handleDeleteTemplate}
                    onDuplicate={handleDuplicateTemplate}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No {category.label.toLowerCase()} templates found.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      Create {category.label} Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="custom">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Custom Templates</CardTitle>
              <CardDescription>
                User-created custom templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customTemplates.length > 0 ? (
                <TemplatesList
                  templates={customTemplates}
                  onEdit={setEditingTemplate}
                  onDelete={handleDeleteTemplate}
                  onDuplicate={handleDuplicateTemplate}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No custom templates found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    Create Custom Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingTemplate} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Modify the template details below' : 'Create a new template for notifications'}
            </DialogDescription>
          </DialogHeader>
          <TemplateCreationForm
            onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setEditingTemplate(null);
            }}
            isLoading={createTemplate.isPending || updateTemplate.isPending}
            initialData={editingTemplate}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesManagement;
