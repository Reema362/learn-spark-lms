import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, CheckCircle, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/database';
import { useCourseCategories } from '@/hooks/useDatabase';
import { sanitizeFileName } from '@/utils/fileUtils';

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category_id: '',
    duration_minutes: 30,
    difficulty_level: 'beginner',
    is_mandatory: false
  });
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const { toast } = useToast();
  const { data: categories = [], refetch: refetchCategories } = useCourseCategories();

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      
      // Show filename info
      const sanitized = sanitizeFileName(file.name);
      if (sanitized !== file.name) {
        toast({
          title: "File Name Sanitized",
          description: `Original: ${file.name}\nSanitized: ${sanitized}`,
        });
      }
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid video file (MP4, WebM, MOV, AVI)",
        variant: "destructive"
      });
    }
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file",
        variant: "destructive"
      });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Category Name Required",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }

    try {
      await DatabaseService.createCourseCategory(newCategory);
      await refetchCategories();
      setNewCategory({ name: '', color: '#3B82F6' });
      setShowNewCategory(false);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !courseData.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a video file and course title",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      console.log('Starting video upload process...');
      console.log('Original filename:', videoFile.name);
      
      // Upload video file with sanitized path
      const videoPath = `videos/${Date.now()}-${sanitizeFileName(videoFile.name)}`;
      console.log('Video upload path:', videoPath);
      
      const videoUrl = await DatabaseService.uploadFile(videoFile, videoPath);
      console.log('Video uploaded successfully, URL:', videoUrl);

      // Check if upload was successful
      if (!videoUrl) {
        throw new Error('Video upload failed - no URL returned from storage service');
      }

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (thumbnailFile) {
        try {
          const thumbnailPath = `thumbnails/${Date.now()}-${sanitizeFileName(thumbnailFile.name)}`;
          console.log('Thumbnail upload path:', thumbnailPath);
          thumbnailUrl = await DatabaseService.uploadFile(thumbnailFile, thumbnailPath);
          console.log('Thumbnail uploaded successfully, URL:', thumbnailUrl);
        } catch (thumbnailError: any) {
          console.warn('Thumbnail upload failed:', thumbnailError);
          toast({
            title: "Thumbnail Upload Warning",
            description: "Video uploaded successfully, but thumbnail upload failed. You can add a thumbnail later.",
            variant: "default"
          });
        }
      }

      // Create course with duration in hours (converted from minutes)
      const course = await DatabaseService.createCourse({
        ...courseData,
        duration_hours: Math.ceil(courseData.duration_minutes / 60), // Convert minutes to hours
        video_url: videoUrl,
        status: 'published', // Set to published so it shows up for learners
        thumbnail_url: thumbnailUrl || null
      });

      console.log('Course created:', course);

      // Create lesson for the video
      await DatabaseService.createLesson({
        title: courseData.title,
        course_id: course.id,
        video_url: videoUrl,
        type: 'video',
        duration_minutes: courseData.duration_minutes,
        order_index: 1
      });

      console.log('Lesson created for course');

      toast({
        title: "Success",
        description: "Video course uploaded and published successfully! Learners can now access it.",
      });

      // Reset form
      setVideoFile(null);
      setThumbnailFile(null);
      setCourseData({
        title: '',
        description: '',
        category_id: '',
        duration_minutes: 30,
        difficulty_level: 'beginner',
        is_mandatory: false
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Show specific error message
      let errorMessage = error.message;
      if (errorMessage.includes('Permission denied')) {
        errorMessage = 'Upload failed: Admin permissions required. Please ensure you are logged in as an administrator.';
      } else if (errorMessage.includes('bucket')) {
        errorMessage = 'Upload failed: Storage bucket not accessible. Please contact support.';
      } else if (!errorMessage || errorMessage === 'undefined') {
        errorMessage = 'Upload failed: Unknown error occurred. Please try again.';
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Upload Video Course
        </CardTitle>
        <CardDescription>
          Upload video courses to the 'courses' storage bucket. Files will be automatically sanitized for compatibility.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="course-title">Course Title *</Label>
            <Input
              id="course-title"
              value={courseData.title}
              onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter course title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={courseData.description}
              onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New
                </Button>
              </div>
              
              {showNewCategory && (
                <div className="p-3 border rounded-lg space-y-2">
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-8"
                    />
                    <Button size="sm" onClick={handleCreateCategory}>Create</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewCategory(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              
              <Select value={courseData.category_id} onValueChange={(value) => setCourseData(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={courseData.duration_minutes}
                onChange={(e) => setCourseData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                min="1"
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={courseData.difficulty_level} onValueChange={(value) => setCourseData(prev => ({ ...prev, difficulty_level: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="video-file">Video File *</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={handleVideoChange}
            />
            {videoFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Files with special characters will be automatically sanitized
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="thumbnail-file">Thumbnail Image (optional)</Label>
            <Input
              id="thumbnail-file"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
            {thumbnailFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {thumbnailFile.name}
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!videoFile || !courseData.title || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading to courses bucket...' : 'Upload & Publish Video Course'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
