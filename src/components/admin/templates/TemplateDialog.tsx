
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TemplateCreationForm from '../TemplateCreationForm';

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate: any;
  onSubmit: (templateData: any) => void;
  isLoading: boolean;
}

const TemplateDialog = ({
  isOpen,
  onClose,
  editingTemplate,
  onSubmit,
  isLoading
}: TemplateDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
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
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          initialData={editingTemplate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
