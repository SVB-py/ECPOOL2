-- Add credits system and attendance tracking

-- Add credits columns to drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS eco_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_earned_today INTEGER DEFAULT 0;

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_at TIMESTAMPTZ DEFAULT now(),
  location JSONB,
  UNIQUE(student_id, route_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Students can mark their own attendance
CREATE POLICY "Students can mark their own attendance"
ON public.attendance FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Students can view their own attendance
CREATE POLICY "Students can view their own attendance"
ON public.attendance FOR SELECT
USING (auth.uid() = student_id);

-- Drivers can view attendance for their routes
CREATE POLICY "Drivers can view attendance for their routes"
ON public.attendance FOR SELECT
USING (route_id IN (
  SELECT r.id FROM public.routes r
  JOIN public.drivers d ON d.id = r.driver_id
  WHERE d.user_id = auth.uid()
));

-- Create live locations table for real-time tracking
CREATE TABLE IF NOT EXISTS public.live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, route_id)
);

ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;

-- Users can update their own location
CREATE POLICY "Users can update their own location"
ON public.live_locations FOR ALL
USING (auth.uid() = user_id);

-- Everyone on the route can view locations
CREATE POLICY "Route participants can view locations"
ON public.live_locations FOR SELECT
USING (
  route_id IN (
    SELECT r.id FROM public.routes r
    JOIN public.drivers d ON d.id = r.driver_id
    WHERE d.user_id = auth.uid()
  )
  OR 
  route_id IN (
    SELECT b.route_id FROM public.bookings b
    WHERE b.student_id = auth.uid()
  )
);

-- Enable realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;