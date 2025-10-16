-- Add UPDATE policy for students to modify their own attendance
CREATE POLICY "Students can update their own attendance"
ON public.attendance
FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);