import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleMeetingDialog } from "./ScheduleMeetingDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

export function FloatingScheduleButton() {
  const { role } = useAuth();

  // Only managers and admins can create meetings
  if (role !== "manager" && role !== "admin") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ScheduleMeetingDialog
        trigger={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <CalendarPlus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Schedule Meeting</TooltipContent>
          </Tooltip>
        }
      />
    </div>
  );
}
