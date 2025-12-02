-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Internships viewable by all" ON public.internships;

-- Create a new PERMISSIVE SELECT policy (PERMISSIVE is the default)
CREATE POLICY "Internships viewable by all" 
ON public.internships 
FOR SELECT 
TO public
USING (true);