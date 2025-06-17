
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EditCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingCourse: any;
  setEditingCourse: (course: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const EditCourseDialog: React.FC<EditCourseDialogProps> = ({
  isOpen,
  onClose,
  editingCourse,
  setEditingCourse,
  onSubmit,
  isLoading
}) => {
  if (!editingCourse) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update course information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Course Title</Label>
            <Input
              id="edit-title"
              value={editingCourse.title}
              onChange={(e) => setEditingCourse(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editingCourse.description || ''}
              onChange={(e) => setEditingCourse(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={editingCourse.status} onValueChange={(value) => setEditingCourse(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
