export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number | null;
  attendees: string[];
  location: string | null;
  meeting_link: string | null;
  google_event_id: string | null;
  google_calendar_synced: boolean;
  created_by: string;
  owner_id: string;
  lead_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  status: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  attendees?: string[];
  location?: string;
  meeting_link?: string;
  location?: string;
  lead_id?: string;
  contact_id?: string;
  deal_id?: string;
}
