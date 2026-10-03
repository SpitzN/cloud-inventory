import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

/** The Applications page with no Applications: what one is, and the ways to make one. */
export function NoApplications() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No applications yet</EmptyTitle>
        <EmptyDescription>
          An application is a named group of resources, such as &ldquo;Payments API&rdquo;.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Link to="/applications/new" className={buttonVariants()}>
          New application
        </Link>
        <Link to="/resources" className={buttonVariants({ variant: "ghost" })}>
          Browse resources
        </Link>
      </EmptyContent>
    </Empty>
  );
}
