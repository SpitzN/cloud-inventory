import { ApplicationDrawer } from "@/features/applications/components/application-drawer";
import { ApplicationList } from "@/features/applications/components/application-list";

export function ApplicationsPage() {
  return (
    <>
      <ApplicationList />
      <ApplicationDrawer />
    </>
  );
}
