import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function ErrorScreen() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>This page ran into an unexpected error.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/resources" className={buttonVariants()}>
          Go to Resources
        </Link>
      </EmptyContent>
    </Empty>
  );
}
