
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/database';
import { useCourseCategories } from '@/hooks/useDatabase';

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category_id: '',
    duration_hours: 1,
    difficulty_level: 'beginner',
    is_mandatory: false
  });
  const { toast } = useToast();
  const { data: categories = [] } = useCourseCategories();

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid video file",
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
      // Upload video file
      const videoPath = `videos/${Date.now()}-${videoFile.name}`;
      const videoUrl = await DatabaseService.uploadFile(videoFile, videoPath);

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbnailPath = `thumbnails/${Date.now()}-${thumbnailFile.name}`;
        thumbnailUrl = await DatabaseService.uploadFile(thumbnailFile, thumbnailPath);
      }

      // Create course
      const course = await DatabaseService.createCourse({
        ...courseData,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl
      });

      // Create lesson for the video
      await DatabaseService.createLesson({
        title: courseData.title,
        course_id: course.id,
        video_url: videoUrl,
        type: 'video',
        duration_minutes: courseData.duration_hours * 60,
        order_index: 1
      });

      toast({
        title: "Success",
        description: "Video course uploaded successfully",
      });

      // Reset form
      setVideoFile(null);
      setThumbnailFile(null);
      setCourseData({
        title: '',
        description: '',
        category_id: '',
        duration_hours: 1,
        difficulty_level: 'beginner',
        is_mandatory: false
      });

    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
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
          Upload video courses in MP4 or other video formats
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
              <Label htmlFor="category">Category</Label>
              <Select value={courseData.category_id} onValueChange={(value) => setCourseData(prev => ({ ...prev, category_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={courseData.duration_hours}
                onChange={(e) => setCourseData(prev => ({ ...prev, duration_hours: parseInt(e.target.value) }))}
                min="1"
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
              accept="video/*"
              onChange={handleVideoChange}
            />
            {videoFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
              </div>
            )}
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
          {uploading ? 'Uploading...' : 'Upload Video Course'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
