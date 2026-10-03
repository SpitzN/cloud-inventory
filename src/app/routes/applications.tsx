import { Outlet } from "react-router";

export function ApplicationsPage() {
  return (
    <>
      <p className="text-sm text-muted-foreground">The saved Applications will be here.</p>
      <Outlet />
    </>
  );
}
