import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { FloatingScheduleButton } from "@/components/meetings/FloatingScheduleButton";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto p-6 min-w-0 max-w-full">
            <div className="min-w-0 max-w-full">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
        <FloatingScheduleButton />
      </div>
    </SidebarProvider>
  );
}
