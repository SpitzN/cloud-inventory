import { Outlet, useMatches } from "react-router";
import { ShellHeader } from "@/app/shell/components/shell-header";
import { ShellSidebar } from "@/app/shell/components/shell-sidebar";
import { useSidebarOpen } from "@/app/shell/hooks/use-sidebar-open";
import { pageRouteId } from "@/app/shell/lib/route-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";

export function Shell() {
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
  const page = pageRouteId(useMatches());

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <ShellSidebar />
      <SidebarInset>
        <ShellHeader />
        {/* Keyed by page, so only a new page fades in, not a filter change or the drawer. */}
        <div
          key={page}
          className="w-full max-w-360 animate-in p-4 duration-200 ease-out fade-in-0 slide-in-from-bottom-1"
        >
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
