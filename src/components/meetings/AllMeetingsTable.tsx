import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllMeetings } from "@/hooks/useMeetings";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export function AllMeetingsTable() {
  const { meetings, loading } = useAllMeetings();
  const { role } = useAuth();

  // Only show for admin
  if (role !== "admin") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Meetings</CardTitle>
        <CardDescription>Complete list of meetings across the organization</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : meetings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="truncate max-w-[200px]">{meeting.title}</p>
                        {meeting.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {meeting.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(meeting.start_time), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {meeting.duration_minutes ? `${meeting.duration_minutes}min` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {meeting.attendees?.length || 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={meeting.status === "scheduled" ? "default" : "secondary"}
                        className="capitalize text-xs"
                      >
                        {meeting.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            <p>No meetings found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
