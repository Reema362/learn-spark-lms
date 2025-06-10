
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplatesList from '../TemplatesList';

interface TemplateTabsContentProps {
  groupedTemplates: Record<string, any[]>;
  customTemplates: any[];
  onEdit: (template: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: any) => void;
  onCreateTemplate: () => void;
}

const categories = [
  { value: 'course-assignment', label: 'Assignment' },
  { value: 'course-completion', label: 'Completion' },
  { value: 'course-reminder', label: 'Reminder' },
  { value: 'course-quiz-failure', label: 'Quiz Failure' },
  { value: 'manager-reminder', label: 'Manager' },
  { value: 'course-certification', label: 'Certification' },
  { value: 'custom', label: 'Custom' }
];

const TemplateTabsContent = ({
  groupedTemplates,
  customTemplates,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateTemplate
}: TemplateTabsContentProps) => {
  return (
    <Tabs defaultValue="course-assignment" className="w-full">
      <TabsList className="grid grid-cols-7 w-full">
        {categories.map(category => (
          <TabsTrigger key={category.value} value={category.value}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.slice(0, -1).map(category => (
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
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No {category.label.toLowerCase()} templates found.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={onCreateTemplate}
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
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No custom templates found.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={onCreateTemplate}
                >
                  Create Custom Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TemplateTabsContent;
