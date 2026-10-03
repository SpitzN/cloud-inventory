import { Outlet } from "react-router";
import { ShellHeader } from "@/app/shell/components/shell-header";
import { ShellSidebar } from "@/app/shell/components/shell-sidebar";
import { useSidebarOpen } from "@/app/shell/hooks/use-sidebar-open";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";

export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <ShellSidebar />
      <SidebarInset>
        <ShellHeader />
        <div className="w-full max-w-360 p-4">
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
