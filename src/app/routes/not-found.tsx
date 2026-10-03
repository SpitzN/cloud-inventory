import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from "@/components/ui/empty";

export function NotFoundPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyDescription>There is no page at this address.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/resources" className={buttonVariants()}>
          Go to Resources
        </Link>
      </EmptyContent>
    </Empty>
  );
}
