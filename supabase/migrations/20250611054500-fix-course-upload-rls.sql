
-- Fix RLS policies for course uploads to allow admin users to upload files and create courses

-- First, ensure the storage bucket policies allow admin access
DO $$
BEGIN
  -- Drop existing storage policies if they exist
  DROP POLICY IF EXISTS "Allow authenticated users to upload course files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to view course files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow admins to update course files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow admins to delete course files" ON storage.objects;
  
  -- Create more permissive storage policies for course uploads
  CREATE POLICY "Allow admin users to upload course files" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'courses' AND public.is_admin_user());

  CREATE POLICY "Allow all authenticated users to view course files" 
  ON storage.objects 
  FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'courses');

  CREATE POLICY "Allow admin users to update course files" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'courses' AND public.is_admin_user())
  WITH CHECK (bucket_id = 'courses' AND public.is_admin_user());

  CREATE POLICY "Allow admin users to delete course files" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'courses' AND public.is_admin_user());

EXCEPTION
  WHEN others THEN
    -- If policies already exist or other errors, continue
    NULL;
END $$;

-- Ensure courses table policies allow admin creation
DO $$
BEGIN
  -- Drop and recreate course policies to ensure they're correct
  DROP POLICY IF EXISTS "courses_insert_policy" ON public.courses;
  DROP POLICY IF EXISTS "courses_update_policy" ON public.courses;
  DROP POLICY IF EXISTS "courses_delete_policy" ON public.courses;
  DROP POLICY IF EXISTS "courses_select_policy" ON public.courses;

  -- Recreate with proper admin access
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

EXCEPTION
  WHEN others THEN
    -- If policies already exist or other errors, continue
    NULL;
END $$;

-- Ensure lessons table policies allow admin creation
DO $$
BEGIN
  DROP POLICY IF EXISTS "lessons_insert_policy" ON public.lessons;
  DROP POLICY IF EXISTS "lessons_update_policy" ON public.lessons;
  DROP POLICY IF EXISTS "lessons_delete_policy" ON public.lessons;
  DROP POLICY IF EXISTS "lessons_select_policy" ON public.lessons;

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

EXCEPTION
  WHEN others THEN
    -- If policies already exist or other errors, continue
    NULL;
END $$;

-- Ensure course_categories table allows admin access for creating new categories
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow users to read categories" ON public.course_categories;
  DROP POLICY IF EXISTS "Allow admins to manage categories" ON public.course_categories;

  CREATE POLICY "categories_select_policy" 
  ON public.course_categories 
  FOR SELECT 
  TO authenticated 
  USING (true);

  CREATE POLICY "categories_insert_policy" 
  ON public.course_categories 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin_user());

  CREATE POLICY "categories_update_policy" 
  ON public.course_categories 
  FOR UPDATE 
  TO authenticated 
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

  CREATE POLICY "categories_delete_policy" 
  ON public.course_categories 
  FOR DELETE 
  TO authenticated 
  USING (public.is_admin_user());

EXCEPTION
  WHEN others THEN
    -- If policies already exist or other errors, continue
    NULL;
END $$;
