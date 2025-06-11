
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText } from 'lucide-react';
import { useTemplates, useDeleteTemplate } from '@/hooks/useDatabase';
import TemplateFilters from './templates/TemplateFilters';
import { TemplateTabsContent } from './templates/TemplateTabsContent';
import TemplateDialog from './templates/TemplateDialog';
import { getFilteredTemplates } from '@/utils/templateUtils';

const TemplatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data: templates = [], isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();

  const filteredTemplates = getFilteredTemplates(templates, searchTerm, selectedType);

  const emailTemplates = filteredTemplates.filter(t => t.type === 'email');
  const smsTemplates = filteredTemplates.filter(t => t.type === 'sms');
  const alertTemplates = filteredTemplates.filter(t => t.type === 'alert');
  const notificationTemplates = filteredTemplates.filter(t => t.type === 'notification');

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate.mutateAsync(templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleDuplicate = (template: any) => {
    setEditingTemplate({
      ...template,
      id: '',
      name: `${template.name} (Copy)`,
      created_at: '',
      updated_at: ''
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
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
          <p className="text-muted-foreground">Create and manage communication templates</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{emailTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Email Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{smsTemplates.length}</div>
            <div className="text-sm text-muted-foreground">SMS Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{alertTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Alert Templates</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TemplateFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Templates Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({filteredTemplates.length})</TabsTrigger>
          <TabsTrigger value="email">Email ({emailTemplates.length})</TabsTrigger>
          <TabsTrigger value="sms">SMS ({smsTemplates.length})</TabsTrigger>
          <TabsTrigger value="alert">Alerts ({alertTemplates.length})</TabsTrigger>
          <TabsTrigger value="notification">Notifications ({notificationTemplates.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <TemplateTabsContent
            templates={filteredTemplates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <TemplateTabsContent
            templates={emailTemplates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          <TemplateTabsContent
            templates={smsTemplates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </TabsContent>

        <TabsContent value="alert" className="mt-6">
          <TemplateTabsContent
            templates={alertTemplates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </TabsContent>

        <TabsContent value="notification" className="mt-6">
          <TemplateTabsContent
            templates={notificationTemplates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <TemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        template={null}
        onSave={() => setIsCreateDialogOpen(false)}
        title="Create New Template"
        description="Create a new communication template"
      />

      {/* Edit Dialog */}
      <TemplateDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        template={editingTemplate}
        onSave={() => {
          setIsEditDialogOpen(false);
          setEditingTemplate(null);
        }}
        title="Edit Template"
        description="Update template information"
      />
    </div>
  );
};

export default TemplatesManagement;
