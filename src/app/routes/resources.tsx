import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { ResourcesTable } from "@/features/resources/components/resources-table";

export function ResourcesPage() {
  return (
    <ResourcesTable
      actions={
        <Link to="/applications/new" className={buttonVariants()}>
          Create application
        </Link>
      }
    />
  );
}
