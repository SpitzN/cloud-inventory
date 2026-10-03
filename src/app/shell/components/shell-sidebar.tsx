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
        <div className="flex h-8 items-center gap-2 px-2 text-sm font-medium">
          <CloudIcon className="size-4 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">Cloud Inventory</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
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
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/**
 * A section's link, active on the section's address and every address below it. The count, when
 * given, shows beside the label and hides on the icon rail.
 */
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
  // Not NavLink: it reports "active" only to its own className and children functions, and
  // SidebarMenuButton needs it as the `isActive` prop.
  const isActive = useMatch(`${to}/*`) !== null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
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
