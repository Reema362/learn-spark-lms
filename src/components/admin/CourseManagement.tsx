import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, RefreshCw } from 'lucide-react';
import { useCourses, useCourseCategories, useCreateCourse, useUpdateCourse, useDeleteCourse, useUploadFile } from '@/hooks/useDatabase';
import { createSampleCategories } from '@/utils/createSampleCategories';
import VideoUpload from './VideoUpload';
import CoursePreview from './CoursePreview';
import { useToast } from '@/hooks/use-toast';
import CourseStats from './courses/CourseStats';
import CourseFilters from './courses/CourseFilters';
import CourseList from './courses/CourseList';
import CreateCourseDialog from './courses/CreateCourseDialog';
import EditCourseDialog from './courses/EditCourseDialog';
import { CourseMigrationUtility } from '@/utils/courseMigration';

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<any>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    duration_hours: 1,
    difficulty_level: 'beginner',
    is_mandatory: false
  });

  const { data: courses = [], isLoading: coursesLoading, refetch: refetchCourses } = useCourses();
  const { data: categories = [] } = useCourseCategories();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const uploadFile = useUploadFile();
  const { toast } = useToast();

  // Check for demo data migration on component mount
  useEffect(() => {
    const checkForDemoData = async () => {
      const demoCourses = JSON.parse(localStorage.getItem('demo-courses') || '[]');
      const isAuthenticated = await CourseMigrationUtility.ensureSupabaseAuthentication();
      
      if (demoCourses.length > 0 && isAuthenticated) {
        toast({
          title: "Demo Data Found",
          description: `Found ${demoCourses.length} courses in demo storage. Click "Migrate Demo Data" to move them to Supabase.`,
          variant: "default",
        });
      }
    };

    checkForDemoData();
  }, [toast]);

  // Initialize sample categories on component mount
  useEffect(() => {
    if (categories.length === 0) {
      createSampleCategories();
    }
  }, []);

  // Auto-refresh courses every 10 seconds to show newly uploaded content
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCourses();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetchCourses]);

  const handleMigrateDemoData = async () => {
    setIsMigrating(true);
    try {
      const result = await CourseMigrationUtility.migrateDemoCoursesToSupabase();
      
      if (result.success) {
        toast({
          title: "Migration Successful",
          description: `Successfully migrated ${result.migratedCount} courses to Supabase. All learners can now access them globally.`,
        });
        refetchCourses();
      } else {
        toast({
          title: "Migration Issues",
          description: `Migrated ${result.migratedCount} courses, but encountered ${result.errors.length} errors. Check console for details.`,
          variant: "destructive",
        });
        console.error('Migration errors:', result.errors);
      }
    } catch (error: any) {
      toast({
        title: "Migration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const filteredCourses = courses.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCourse = async () => {
    try {
      await createCourse.mutateAsync(newCourse);
      setIsCreateDialogOpen(false);
      setNewCourse({
        title: '',
        description: '',
        content: '',
        category_id: '',
        duration_hours: 1,
        difficulty_level: 'beginner',
        is_mandatory: false
      });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;
    try {
      await updateCourse.mutateAsync({
        id: editingCourse.id,
        updates: editingCourse
      });
      setIsEditDialogOpen(false);
      setEditingCourse(null);
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await deleteCourse.mutateAsync(courseId);
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
      } catch (error: any) {
        console.error('Error deleting course:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete course",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'content') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const path = `${type}/${Date.now()}-${file.name}`;
      const url = await uploadFile.mutateAsync({ file, path });
      
      if (type === 'thumbnail') {
        setNewCourse(prev => ({ ...prev, thumbnail_url: url }));
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  if (coursesLoading) {
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
          <h2 className="text-3xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create and manage learning content</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleMigrateDemoData}
            disabled={isMigrating}
          >
            {isMigrating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Migrate Demo Data
          </Button>
          <Button variant="outline" onClick={() => refetchCourses()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Courses
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <CourseStats courses={courses} categories={categories} />

      {/* Tabs for different course management sections */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Course List</TabsTrigger>
          <TabsTrigger value="video-upload">Video Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-4">
          {/* Filters */}
          <CourseFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />

          {/* Courses Grid */}
          <CourseList
            courses={filteredCourses}
            onEdit={(course) => {
              setEditingCourse(course);
              setIsEditDialogOpen(true);
            }}
            onDelete={handleDeleteCourse}
            onPreview={setPreviewCourse}
            onCreateNew={() => setIsCreateDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="video-upload">
          <VideoUpload />
        </TabsContent>
      </Tabs>

      {/* Create Course Dialog */}
      <CreateCourseDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        newCourse={newCourse}
        setNewCourse={setNewCourse}
        categories={categories}
        onSubmit={handleCreateCourse}
        isLoading={createCourse.isPending}
        onFileUpload={handleFileUpload}
      />

      {/* Edit Course Dialog */}
      <EditCourseDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editingCourse={editingCourse}
        setEditingCourse={setEditingCourse}
        onSubmit={handleEditCourse}
        isLoading={updateCourse.isPending}
      />

      {/* Course Preview Dialog */}
      {previewCourse && (
        <CoursePreview
          course={previewCourse}
          isOpen={!!previewCourse}
          onClose={() => setPreviewCourse(null)}
        />
      )}
    </div>
  );
};

export default CourseManagement;
