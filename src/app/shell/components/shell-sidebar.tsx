import { BoxesIcon, CloudIcon, ServerIcon } from "lucide-react";
import type { ReactElement } from "react";
import { Link, useMatch } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { resources } from "@/domain/dataset";
import { useApplicationsStore } from "@/features/applications/stores/applications";

export function ShellSidebar() {
  const applicationCount = useApplicationsStore((state) => state.applications.length);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-8 items-center gap-2 px-2 text-sm font-semibold">
          <CloudIcon className="size-4 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">Cloud Inventory</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <nav aria-label="Main">
            <SidebarMenu>
              <SectionItem
                to="/resources"
                label="Resources"
                icon={<ServerIcon />}
                count={resources.length}
              />
              <SectionItem
                to="/applications"
                label="Applications"
                icon={<BoxesIcon />}
                count={applicationCount}
              />
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function SectionItem({
  to,
  label,
  icon,
  count,
}: {
  to: string;
  label: string;
  icon: ReactElement;
  count?: number;
}) {
  // Not NavLink, which reports "active" only to its own className and children functions.
  const isActive = useMatch(`${to}/*`) !== null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        variant="fade"
        isActive={isActive}
        tooltip={label}
        render={<Link to={to} aria-current={isActive ? "page" : undefined} />}
      >
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
      {count !== undefined && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}
