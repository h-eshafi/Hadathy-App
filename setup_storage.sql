-- SQL Script to set up event-covers storage bucket in Supabase
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-covers', 'event-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
-- (This should already be enabled by default in Supabase)

-- 3. Policy: Allow Public Read Access
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'event-covers');

-- 4. Policy: Allow Authenticated Uploads
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
CREATE POLICY "Authenticated Upload Access" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event-covers' 
  AND auth.role() = 'authenticated'
);

-- 5. Policy: Allow Owners to Update
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
CREATE POLICY "Authenticated Update Access" ON storage.objects FOR UPDATE USING (
  bucket_id = 'event-covers' 
  AND auth.role() = 'authenticated'
);

-- 6. Policy: Allow Owners to Delete
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
CREATE POLICY "Authenticated Delete Access" ON storage.objects FOR DELETE USING (
  bucket_id = 'event-covers' 
  AND auth.role() = 'authenticated'
);
