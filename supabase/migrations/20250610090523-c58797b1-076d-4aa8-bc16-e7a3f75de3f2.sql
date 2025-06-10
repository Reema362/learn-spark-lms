
-- First, let's create the courses storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('courses', 'courses', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage.objects to allow admins to upload files
CREATE POLICY "Allow authenticated users to upload course files" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'courses');

CREATE POLICY "Allow authenticated users to view course files" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'courses');

CREATE POLICY "Allow admins to update course files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'courses' AND public.is_admin_user());

CREATE POLICY "Allow admins to delete course files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'courses' AND public.is_admin_user());

-- Ensure the courses table has proper video_url column
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS video_url text;

-- Update the courses RLS policies to ensure they work correctly
DROP POLICY IF EXISTS "Allow users to read courses" ON public.courses;
DROP POLICY IF EXISTS "Allow admins to insert courses" ON public.courses;
DROP POLICY IF EXISTS "Allow admins to update courses" ON public.courses;
DROP POLICY IF EXISTS "Allow admins to delete courses" ON public.courses;

-- Recreate courses policies with better naming
CREATE POLICY "courses_select_policy" 
ON public.courses 
FOR SELECT 
TO authenticated 
USING (status = 'published' OR public.is_admin_user());

CREATE POLICY "courses_insert_policy" 
ON public.courses 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin_user());

CREATE POLICY "courses_update_policy" 
ON public.courses 
FOR UPDATE 
TO authenticated 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "courses_delete_policy" 
ON public.courses 
FOR DELETE 
TO authenticated 
USING (public.is_admin_user());

-- Ensure lessons table has proper video_url column and policies
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS video_url text;

-- Update lessons policies
DROP POLICY IF EXISTS "Allow users to read lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow admins to manage lessons" ON public.lessons;

CREATE POLICY "lessons_select_policy" 
ON public.lessons 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = lessons.course_id 
    AND (status = 'published' OR public.is_admin_user())
  )
);

CREATE POLICY "lessons_insert_policy" 
ON public.lessons 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin_user());

CREATE POLICY "lessons_update_policy" 
ON public.lessons 
FOR UPDATE 
TO authenticated 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "lessons_delete_policy" 
ON public.lessons 
FOR DELETE 
TO authenticated 
USING (public.is_admin_user());
