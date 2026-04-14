
-- Drop the recursive policy
DROP POLICY IF EXISTS "Team managers can manage their team members" ON public.team_members;

-- Recreate using the SECURITY DEFINER function to avoid recursion
CREATE POLICY "Team managers can manage their team members"
ON public.team_members
FOR ALL
USING (public.is_team_manager(auth.uid(), team_id));
