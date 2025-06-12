
-- Create the courses storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

-- Create RLS policies for the courses bucket
CREATE POLICY "Give users authenticated access to courses bucket" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'courses');

CREATE POLICY "Give public read access to courses bucket" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'courses');

CREATE POLICY "Give admins full access to courses bucket" ON storage.objects
FOR ALL TO authenticated 
USING (bucket_id = 'courses' AND EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));
