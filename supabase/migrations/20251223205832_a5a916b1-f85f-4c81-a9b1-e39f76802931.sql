-- Create event_rsvps table for club event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.club_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Everyone can view RSVPs
CREATE POLICY "RSVPs viewable by all"
ON public.event_rsvps FOR SELECT
USING (true);

-- Users can create their own RSVPs
CREATE POLICY "Users can create own RSVPs"
ON public.event_rsvps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVPs
CREATE POLICY "Users can update own RSVPs"
ON public.event_rsvps FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own RSVPs
CREATE POLICY "Users can delete own RSVPs"
ON public.event_rsvps FOR DELETE
USING (auth.uid() = user_id);

-- Create mentor_availability table for scheduling
CREATE TABLE public.mentor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, day_of_week, start_time)
);

-- Enable RLS
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;

-- Everyone can view availability
CREATE POLICY "Availability viewable by all"
ON public.mentor_availability FOR SELECT
USING (true);

-- Mentors can manage their own availability
CREATE POLICY "Mentors can create own availability"
ON public.mentor_availability FOR INSERT
WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "Mentors can update own availability"
ON public.mentor_availability FOR UPDATE
USING (auth.uid() = mentor_id);

CREATE POLICY "Mentors can delete own availability"
ON public.mentor_availability FOR DELETE
USING (auth.uid() = mentor_id);

-- Create mentorship_sessions table for booked sessions
CREATE TABLE public.mentorship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.mentorship_sessions FOR SELECT
USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Students can create sessions with mentors
CREATE POLICY "Students can create sessions"
ON public.mentorship_sessions FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Both parties can update sessions
CREATE POLICY "Users can update own sessions"
ON public.mentorship_sessions FOR UPDATE
USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Triggers for updated_at
CREATE TRIGGER update_event_rsvps_updated_at
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_availability_updated_at
  BEFORE UPDATE ON public.mentor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_sessions_updated_at
  BEFORE UPDATE ON public.mentorship_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();