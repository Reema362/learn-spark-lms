
-- Let's work with the existing user_role enum values and create proper RLS policies
-- First, let's check what the current user_role enum contains and work with those values

-- Drop existing problematic functions
DROP FUNCTION IF EXISTS public.can_manage_courses(uuid);
DROP FUNCTION IF EXISTS public.can_manage_courses_fallback(uuid);

-- Create a simple function that checks for admin role (which we know exists)
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id 
    AND role = 'admin'
  );
$$;

-- Drop all existing policies on courses table
DROP POLICY IF EXISTS "Allow authenticated read" ON public.courses;
DROP POLICY IF EXISTS "Allow admin manage" ON public.courses;
DROP POLICY IF EXISTS "Allow authenticated users to read published courses" ON public.courses;
DROP POLICY IF EXISTS "Allow course managers to read all courses" ON public.courses;
DROP POLICY IF EXISTS "Allow course managers to insert courses" ON public.courses;
DROP POLICY IF EXISTS "Allow course managers to update courses" ON public.courses;
DROP POLICY IF EXISTS "Allow admins to delete courses" ON public.courses;

-- Create new RLS policies for courses table
-- Policy 1: Allow all authenticated users to read published courses, admins can read all
CREATE POLICY "Allow users to read courses" 
ON public.courses 
FOR SELECT 
TO authenticated 
USING (status = 'published' OR public.is_admin_user());

-- Policy 2: Allow admins to insert new courses
CREATE POLICY "Allow admins to insert courses" 
ON public.courses 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin_user());

-- Policy 3: Allow admins to update courses
CREATE POLICY "Allow admins to update courses" 
ON public.courses 
FOR UPDATE 
TO authenticated 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Policy 4: Allow admins to delete courses
CREATE POLICY "Allow admins to delete courses" 
ON public.courses 
FOR DELETE 
TO authenticated 
USING (public.is_admin_user());

-- Update course_categories table policies
DROP POLICY IF EXISTS "Allow authenticated read" ON public.course_categories;
DROP POLICY IF EXISTS "Allow admin manage" ON public.course_categories;
DROP POLICY IF EXISTS "Allow authenticated users to read categories" ON public.course_categories;
DROP POLICY IF EXISTS "Allow course managers to manage categories" ON public.course_categories;

-- Allow all authenticated users to read categories
CREATE POLICY "Allow users to read categories" 
ON public.course_categories 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow admins to manage categories
CREATE POLICY "Allow admins to manage categories" 
ON public.course_categories 
FOR ALL 
TO authenticated 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Update lessons table policies
DROP POLICY IF EXISTS "Allow authenticated read" ON public.lessons;
DROP POLICY IF EXISTS "Allow admin manage" ON public.lessons;
DROP POLICY IF EXISTS "Allow users to read lessons" ON public.lessons;
DROP POLICY IF EXISTS "Allow course managers to manage lessons" ON public.lessons;

-- Allow users to read lessons from published courses or if they are admin
CREATE POLICY "Allow users to read lessons" 
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

-- Allow admins to manage lessons
CREATE POLICY "Allow admins to manage lessons" 
ON public.lessons 
FOR ALL 
TO authenticated 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());
