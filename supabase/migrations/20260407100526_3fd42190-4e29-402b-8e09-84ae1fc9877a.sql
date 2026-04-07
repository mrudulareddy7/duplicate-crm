
-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  attendees TEXT[] DEFAULT '{}',
  location TEXT,
  meeting_link TEXT,
  google_event_id TEXT,
  google_calendar_synced BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  owner_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all meetings"
  ON public.meetings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Managers can view all meetings"
  ON public.meetings FOR SELECT
  USING (is_manager_or_above(auth.uid()));

CREATE POLICY "Managers can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (is_manager_or_above(auth.uid()));

CREATE POLICY "Managers can update meetings"
  ON public.meetings FOR UPDATE
  USING (is_manager_or_above(auth.uid()));

CREATE POLICY "Users can view their own meetings"
  ON public.meetings FOR SELECT
  USING (owner_id = auth.uid() OR created_by = auth.uid() OR auth.uid()::text = ANY(attendees));

CREATE POLICY "Users can create their own meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own meetings"
  ON public.meetings FOR UPDATE
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete their own meetings"
  ON public.meetings FOR DELETE
  USING (owner_id = auth.uid() OR created_by = auth.uid() OR is_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
