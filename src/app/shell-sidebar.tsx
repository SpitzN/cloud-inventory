import { BoxesIcon, CloudIcon, ServerIcon } from "lucide-react";
import type { ReactElement } from "react";
import { Link, useMatch } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/** The product name and the two sections. Folds to an icon rail. */
export function ShellSidebar() {
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
            <SectionItem to="/resources" label="Resources" icon={<ServerIcon />} />
            <SectionItem to="/applications" label="Applications" icon={<BoxesIcon />} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/** A section's link, active on the section's address and every address below it. */
function SectionItem({ to, label, icon }: { to: string; label: string; icon: ReactElement }) {
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
    </SidebarMenuItem>
  );
}
