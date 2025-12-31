-- Fix 1: Restrict notification creation to only allow notifications between users with existing relationships
DROP POLICY IF EXISTS "Users can create notifications for others" ON public.notifications;

CREATE POLICY "Users can notify related users only"
ON public.notifications FOR INSERT
WITH CHECK (
  -- Allow notifications to users you have a conversation with
  EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE (mentor_id = auth.uid() AND student_id = user_id)
       OR (student_id = auth.uid() AND mentor_id = user_id)
  )
  OR
  -- Allow notifications for mentorship requests
  EXISTS (
    SELECT 1 FROM mentorship_requests
    WHERE (mentor_id = auth.uid() AND student_id = user_id)
       OR (student_id = auth.uid() AND mentor_id = user_id)
  )
  OR
  -- Allow admins to create notifications for anyone
  has_role(auth.uid(), 'admin')
);

-- Fix 2: Make chat-files bucket private and update policies
UPDATE storage.buckets SET public = false WHERE id = 'chat-files';

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view chat files" ON storage.objects;

-- Create secure policy for viewing chat files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-files' AND
  auth.uid() IS NOT NULL AND
  (
    -- Allow access to own uploads (files in user's folder)
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Allow access to resumes folder for own files
    ((storage.foldername(name))[1] = 'resumes' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    -- Allow access to videos folder for own files
    ((storage.foldername(name))[1] = 'videos' AND (storage.foldername(name))[2] = auth.uid()::text)
    OR
    -- Allow access if file is in a conversation the user is part of
    EXISTS (
      SELECT 1 FROM chat_messages m
      JOIN chat_conversations c ON m.conversation_id = c.id
      WHERE m.file_url LIKE '%' || name || '%'
        AND (c.mentor_id = auth.uid() OR c.student_id = auth.uid())
    )
  )
);

-- Fix 3: Prevent club_leader role self-assignment via database constraint
-- Add a policy that only allows admin to create club_leader roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate admin policy for all operations
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add policy to allow users to insert their own role BUT not club_leader or admin
CREATE POLICY "Users can create own non-privileged role"
ON public.user_roles FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND role NOT IN ('admin', 'club_leader')
);

-- Fix 4: Delete the hardcoded admin account
DELETE FROM public.user_roles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
);

DELETE FROM auth.users WHERE email = 'admin@gmail.com';