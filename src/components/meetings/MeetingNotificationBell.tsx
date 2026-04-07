import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Clock, Video } from "lucide-react";
import { useUpcomingMeetings } from "@/hooks/useMeetings";
import { format, differenceInMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function MeetingNotificationBell() {
  const { upcoming } = useUpcomingMeetings(5);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Meetings within the next 30 minutes that haven't been dismissed
  const imminent = upcoming.filter((m) => {
    const minutesUntil = differenceInMinutes(new Date(m.start_time), new Date());
    return minutesUntil <= 30 && minutesUntil >= -5 && !dismissed.has(m.id);
  });

  const hasNotifications = imminent.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {imminent.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Meeting Reminders</h4>
          {imminent.length > 0 ? (
            imminent.map((meeting) => {
              const minutesUntil = differenceInMinutes(
                new Date(meeting.start_time),
                new Date()
              );
              return (
                <div
                  key={meeting.id}
                  className="flex items-start gap-2 rounded-md border p-2"
                >
                  <Video className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(meeting.start_time), "h:mm a")}
                      {minutesUntil > 0
                        ? ` · in ${minutesUntil} min`
                        : " · starting now"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs h-7"
                    onClick={() =>
                      setDismissed((prev) => new Set([...prev, meeting.id]))
                    }
                  >
                    Dismiss
                  </Button>
                </div>
              );
            })
          ) : upcoming.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                No imminent meetings. Next up:
              </p>
              {upcoming.slice(0, 3).map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="truncate">{m.title}</span>
                  <span className="shrink-0">
                    {format(new Date(m.start_time), "MMM d, h:mm a")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              No upcoming meetings
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
