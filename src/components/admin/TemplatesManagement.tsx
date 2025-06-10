
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/hooks/useDatabase';
import { getTemplateCategory } from '@/utils/templateUtils';
import TemplateFilters from './templates/TemplateFilters';
import TemplateTabsContent from './templates/TemplateTabsContent';
import TemplateDialog from './templates/TemplateDialog';

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

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || getTemplateCategory(template.name) === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const groupedTemplates = ['course-assignment', 'course-completion', 'course-reminder', 'course-quiz-failure', 'manager-reminder', 'course-certification'].reduce((acc, category) => {
    acc[category] = filteredTemplates.filter(template => 
      getTemplateCategory(template.name) === category
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
        await deleteTemplate.mutateAsync({ id });
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
      <TemplateFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* Templates organized by category */}
      <TemplateTabsContent
        groupedTemplates={groupedTemplates}
        customTemplates={customTemplates}
        onEdit={setEditingTemplate}
        onDelete={handleDeleteTemplate}
        onDuplicate={handleDuplicateTemplate}
        onCreateTemplate={() => setIsCreateDialogOpen(true)}
      />

      {/* Create/Edit Dialog */}
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
