-- Allow users to insert notifications for any user (needed for messaging system)
CREATE POLICY "Users can create notifications for others"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Add helpful comment
COMMENT ON POLICY "Users can create notifications for others" ON public.notifications IS 
'Allows users to create notifications when sending messages or performing other actions. Consider moving to triggers/edge functions for better security in production.';