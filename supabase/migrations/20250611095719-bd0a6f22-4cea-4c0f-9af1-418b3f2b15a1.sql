
-- Create the courses storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('courses', 'courses', true, 52428800, ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to update course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to upload course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to view course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete course files" ON storage.objects;

-- Create comprehensive storage policies for the courses bucket
CREATE POLICY "courses_bucket_insert_policy" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'courses');

CREATE POLICY "courses_bucket_select_policy" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'courses');

CREATE POLICY "courses_bucket_update_policy" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'courses' AND public.is_admin_user())
WITH CHECK (bucket_id = 'courses' AND public.is_admin_user());

CREATE POLICY "courses_bucket_delete_policy" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'courses' AND public.is_admin_user());
