
-- Ensure the courses storage bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create RLS policies for the courses bucket
DROP POLICY IF EXISTS "Give authenticated users access to courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give public read access to courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give admins full access to courses bucket" ON storage.objects;

-- Allow public read access to courses bucket (so learners can view videos)
CREATE POLICY "Public read access to courses bucket" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'courses');

-- Allow authenticated users to upload to courses bucket
CREATE POLICY "Authenticated upload to courses bucket" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'courses');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated update courses bucket" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'courses');

-- Allow authenticated users to delete from courses bucket
CREATE POLICY "Authenticated delete from courses bucket" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'courses');
