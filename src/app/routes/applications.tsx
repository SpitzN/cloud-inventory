import { Outlet } from "react-router";
import { ApplicationList } from "@/features/applications/components/application-list";

export function ApplicationsPage() {
  return (
    <>
      <ApplicationList />
      <Outlet />
    </>
  );
}
