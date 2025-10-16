-- Allow authenticated users to create their own profile, driver record, and role rows
-- Run this migration to keep demo auto-verification working under RLS

-- Profiles: permit inserts by the owning user
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Drivers: permit inserts and updates by the owning user (if not already covered)
DROP POLICY IF EXISTS "Users can insert their driver record" ON public.drivers;
CREATE POLICY "Users can insert their driver record"
ON public.drivers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User roles: permit inserts and updates by the owning user
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
CREATE POLICY "Users can manage their own roles"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
CREATE POLICY "Users can update their own roles"
ON public.user_roles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
