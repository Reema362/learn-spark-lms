
-- Drop the problematic policy that's causing issues
DROP POLICY IF EXISTS "courses_bucket_insert_policy" ON storage.objects;

-- Create a comprehensive admin upload policy
CREATE POLICY "courses_admin_upload_policy" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'courses' AND 
  public.is_admin_user(auth.uid())
);

-- Create a fallback policy for general authenticated uploads (for demo mode)
CREATE POLICY "courses_authenticated_fallback_policy" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'courses'
);
