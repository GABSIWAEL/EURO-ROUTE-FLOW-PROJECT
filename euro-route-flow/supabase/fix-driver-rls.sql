-- Add missing RLS policy for drivers to view their own record
CREATE POLICY "Drivers can view own record"
    ON public.drivers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
