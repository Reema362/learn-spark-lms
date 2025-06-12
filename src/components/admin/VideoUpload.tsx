import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, CheckCircle, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/storageService';
import { CourseService } from '@/services/courseService';
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
      await CourseService.createCourseCategory(newCategory);
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
      console.log('Starting admin video upload process...');
      console.log('Original filename:', videoFile.name);
      
      // Upload video file with improved error handling
      const videoPath = `videos/${Date.now()}-${sanitizeFileName(videoFile.name)}`;
      console.log('Video upload path:', videoPath);
      
      const videoUrl = await StorageService.uploadFile(videoFile, videoPath);
      console.log('Video uploaded successfully, URL:', videoUrl);

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbnailPath = `thumbnails/${Date.now()}-${sanitizeFileName(thumbnailFile.name)}`;
        console.log('Thumbnail upload path:', thumbnailPath);
        thumbnailUrl = await StorageService.uploadFile(thumbnailFile, thumbnailPath);
        console.log('Thumbnail uploaded successfully, URL:', thumbnailUrl);
      }

      // Create course with duration in hours (converted from minutes) - defaults to draft
      const course = await CourseService.createCourse({
        ...courseData,
        duration_hours: Math.ceil(courseData.duration_minutes / 60), // Convert minutes to hours
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl
      });

      console.log('Course created successfully as draft:', course);

      // Create lesson for the video
      await CourseService.createLesson({
        title: courseData.title,
        course_id: course.id,
        video_url: videoUrl,
        type: 'video',
        duration_minutes: courseData.duration_minutes,
        order_index: 1
      });

      console.log('Lesson created successfully for course');

      toast({
        title: "Upload Successful!",
        description: "Video course uploaded successfully and saved as draft. You can publish it from Course Management.",
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
      console.error('Admin upload error:', error);
      toast({
        title: "Upload Failed",
        description: `Upload failed: ${error.message}. Please check your admin permissions and try again.`,
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
          Admin Video Course Upload
        </CardTitle>
        <CardDescription>
          Upload video courses as an administrator. Courses will be created as drafts and can be published later.
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
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              Storage policies configured - admin upload enabled
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
          {uploading ? 'Uploading Video Course...' : 'Upload Video Course as Draft'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
