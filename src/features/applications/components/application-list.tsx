import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { ApplicationCard } from "@/features/applications/components/application-card";
import { NoApplications } from "@/features/applications/components/no-applications";
import { useApplicationsStore } from "@/features/applications/stores/applications";

/** The saved Applications as a grid of cards, newest first, under their count and "New application". */
export function ApplicationList() {
  const applications = useApplicationsStore((state) => state.applications);

  if (applications.length === 0) {
    return <NoApplications />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {applications.length} {applications.length === 1 ? "application" : "applications"}
        </span>
        <Link to="/applications/new" className={buttonVariants({ className: "ml-auto" })}>
          New application
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {applications.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>
    </div>
  );
}
