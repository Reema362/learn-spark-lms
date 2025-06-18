
-- Create courses bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "courses_admin_only_upload" ON storage.objects;
DROP POLICY IF EXISTS "courses_public_read" ON storage.objects;
DROP POLICY IF EXISTS "courses_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "courses_admin_delete" ON storage.objects;

-- Create comprehensive RLS policies for courses bucket
CREATE POLICY "courses_admin_upload" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'courses' AND 
  (
    public.is_admin_user(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

CREATE POLICY "courses_public_read" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'courses');

CREATE POLICY "courses_admin_update" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'courses' AND 
  (
    public.is_admin_user(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
)
WITH CHECK (
  bucket_id = 'courses' AND 
  (
    public.is_admin_user(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

CREATE POLICY "courses_admin_delete" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'courses' AND 
  (
    public.is_admin_user(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);
