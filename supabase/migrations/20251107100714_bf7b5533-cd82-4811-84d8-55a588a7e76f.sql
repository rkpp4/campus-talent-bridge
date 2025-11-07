-- Add RLS policy to allow admins to update clubs
CREATE POLICY "Admins can update all clubs"
ON public.clubs
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));