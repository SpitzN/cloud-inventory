import { ChevronLeftIcon } from "lucide-react";
import { useMatches } from "react-router";
import { IconControl } from "@/app/shell/components/icon-control";
import { ThemeSwitch } from "@/app/shell/components/theme-switch";
import { routeHeader } from "@/app/shell/lib/route-header";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLeaveNewApplication } from "@/features/applications/hooks/use-leave-new-application";

/** Also sets the document title. */
export function ShellHeader() {
  const { title, backChevron } = routeHeader(useMatches());

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <title>{`${title} · Cloud Inventory`}</title>
      <IconControl label="Toggle sidebar" render={<SidebarTrigger />} />
      {backChevron && <BackChevron />}
      <h1 className="text-sm font-medium">{title}</h1>
      <div className="ml-auto">
        <ThemeSwitch />
      </div>
    </header>
  );
}

function BackChevron() {
  const leave = useLeaveNewApplication();

  return (
    <IconControl label="Back" render={<Button variant="ghost" size="icon-sm" onClick={leave} />}>
      <ChevronLeftIcon />
    </IconControl>
  );
}
