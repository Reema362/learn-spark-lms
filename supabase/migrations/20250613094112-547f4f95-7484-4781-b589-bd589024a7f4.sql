
-- Drop all existing conflicting INSERT policies for courses bucket
DROP POLICY IF EXISTS "courses_bucket_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "courses_authenticated_fallback_policy" ON storage.objects;
DROP POLICY IF EXISTS "courses_admin_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "courses_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;

-- Drop any outdated policies referencing non-existent buckets
DROP POLICY IF EXISTS "Allow authenticated users to upload course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to upload course files" ON storage.objects;

-- Drop existing read policies to avoid conflicts
DROP POLICY IF EXISTS "courses_bucket_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "courses_public_read" ON storage.objects;

-- Create a single, clear admin upload policy for courses bucket
CREATE POLICY "courses_admin_only_upload" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'courses' AND 
  public.is_admin_user(auth.uid())
);

-- Create public read access for video playback
CREATE POLICY "courses_public_read" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'courses');

-- Update the admin check function to handle demo mode properly
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin role in profiles table
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- For demo mode, we'll rely on the application layer to handle admin checks
  -- This function will return false for demo users, but the app handles demo separately
  RETURN FALSE;
END;
$$;
