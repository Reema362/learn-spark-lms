
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useDatabase';
import TemplateFilters from './templates/TemplateFilters';
import TemplateTabsContent from './templates/TemplateTabsContent';
import TemplateDialog from './templates/TemplateDialog';
import { categories } from '@/utils/templateUtils';

const TemplatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data: templates = [], isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleCreateTemplate = async (templateData: any) => {
    try {
      await createTemplate.mutateAsync(templateData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (templateData: any) => {
    if (!editingTemplate) return;
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

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate.mutateAsync(templateId);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleDuplicateTemplate = (template: any) => {
    const duplicatedTemplate = {
      ...template,
      name: `${template.name} (Copy)`,
      id: undefined
    };
    setEditingTemplate(duplicatedTemplate);
  };

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const defaultTemplates = filteredTemplates.filter((template: any) => 
    template.name.startsWith('Default')
  );

  const customTemplates = filteredTemplates.filter((template: any) => 
    !template.name.startsWith('Default')
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Templates Management</h2>
          <p className="text-muted-foreground">Create and manage notification templates</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{defaultTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Default Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">{customTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Custom Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{categories.length - 1}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      <TemplateFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <Tabs defaultValue="default" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Default Templates ({defaultTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Custom Templates ({customTemplates.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="default">
          <TemplateTabsContent
            templates={defaultTemplates}
            onEdit={setEditingTemplate}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            emptyMessage="No default templates found matching your criteria."
          />
        </TabsContent>

        <TabsContent value="custom">
          <TemplateTabsContent
            templates={customTemplates}
            onEdit={setEditingTemplate}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            emptyMessage="No custom templates found. Create your first custom template!"
          />
        </TabsContent>
      </Tabs>

      <TemplateDialog
        isOpen={isCreateDialogOpen || !!editingTemplate}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
        editingTemplate={editingTemplate}
        onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        isLoading={createTemplate.isPending || updateTemplate.isPending}
      />
    </div>
  );
};

export default TemplatesManagement;
