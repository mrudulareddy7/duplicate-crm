import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Clock, ExternalLink, MapPin, Video } from "lucide-react";
import { useUpcomingMeetings } from "@/hooks/useMeetings";
import { ScheduleMeetingDialog } from "./ScheduleMeetingDialog";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";

export function UpcomingMeetingsWidget() {
  const { upcoming, loading } = useUpcomingMeetings(5);
  const { role } = useAuth();

  const canCreate = role === "manager" || role === "admin";

  const title =
    role === "admin"
      ? "All Upcoming Meetings"
      : role === "manager"
        ? "My Upcoming Meetings"
        : "My Meetings";

  const description =
    role === "admin"
      ? "All scheduled meetings across the organization"
      : role === "manager"
        ? "Meetings you've created"
        : "Meetings assigned to you";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {canCreate && <ScheduleMeetingDialog />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium truncate">{meeting.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(meeting.start_time), "MMM d, h:mm a")}
                    </span>
                    {meeting.duration_minutes && (
                      <span>· {meeting.duration_minutes}min</span>
                    )}
                    {meeting.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {meeting.location}
                      </span>
                    )}
                  </div>
                  {meeting.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {meeting.description}
                    </p>
                  )}
                  {meeting.attendees?.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate">
                      {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {formatDistanceToNow(new Date(meeting.start_time), { addSuffix: true })}
                  </Badge>
                  {(meeting.meeting_link || (meeting.location && /^https?:\/\//i.test(meeting.location))) && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = meeting.meeting_link || meeting.location;
                        if (link) window.open(link, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Join
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <p>No upcoming meetings</p>
              {canCreate && (
                <ScheduleMeetingDialog
                  trigger={
                    <Button variant="outline" size="sm">
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Schedule one
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
