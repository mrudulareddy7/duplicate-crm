import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Meeting, CreateMeetingData } from "@/types/meetings";

export function useMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setMeetings((data as unknown as Meeting[]) || []);
    } catch (error: any) {
      console.error("Error fetching meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("meetings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings" },
        () => fetchMeetings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMeetings]);

  async function createMeeting(data: CreateMeetingData) {
    if (!user) return;
    try {
      const { error } = await supabase.from("meetings").insert({
        ...data,
        created_by: user.id,
        owner_id: user.id,
        attendees: data.attendees || [],
      } as any);

      if (error) throw error;
      toast.success("Meeting scheduled successfully");
      await fetchMeetings();
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      toast.error("Failed to schedule meeting");
    }
  }

  async function updateMeeting(id: string, updates: Partial<Meeting>) {
    try {
      const { error } = await supabase
        .from("meetings")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;
      toast.success("Meeting updated");
      await fetchMeetings();
    } catch (error: any) {
      console.error("Error updating meeting:", error);
      toast.error("Failed to update meeting");
    }
  }

  async function deleteMeeting(id: string) {
    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Meeting deleted");
      await fetchMeetings();
    } catch (error: any) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  }

  return { meetings, loading, createMeeting, updateMeeting, deleteMeeting, refetch: fetchMeetings };
}

export function useUpcomingMeetings(limit = 5) {
  const { meetings, loading } = useMeetings();
  const now = new Date().toISOString();

  const upcoming = meetings
    .filter((m) => m.start_time >= now && m.status === "scheduled")
    .slice(0, limit);

  return { upcoming, loading };
}
