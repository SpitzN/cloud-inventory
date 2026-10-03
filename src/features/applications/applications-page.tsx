import { Outlet } from "react-router";

/** The Applications page; an Application's drawer renders over it through the outlet. */
export function ApplicationsPage() {
  return (
    <>
      <p className="text-sm text-muted-foreground">The saved Applications will be here.</p>
      <Outlet />
    </>
  );
}
