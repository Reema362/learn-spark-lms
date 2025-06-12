
-- Drop all existing conflicting policies for the courses bucket
DROP POLICY IF EXISTS "Give users authenticated access to courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give public read access to courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Give admins full access to courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete from courses bucket" ON storage.objects;
DROP POLICY IF EXISTS "courses_bucket_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "courses_bucket_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "courses_bucket_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "courses_bucket_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to upload course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated users to view course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update course files" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete course files" ON storage.objects;

-- Create simple, clear policies for the courses bucket
-- 1. Allow public read access (so learners can view videos)
CREATE POLICY "courses_public_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'courses');

-- 2. Allow authenticated users to insert files
CREATE POLICY "courses_authenticated_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'courses');

-- 3. Allow authenticated users to update files
CREATE POLICY "courses_authenticated_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'courses');

-- 4. Allow authenticated users to delete files
CREATE POLICY "courses_authenticated_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'courses');
