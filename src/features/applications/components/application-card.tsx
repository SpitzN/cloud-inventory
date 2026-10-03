import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Application } from "@/domain/application";

/** One Application as a card that is, as a whole, a link to its drawer. */
export function ApplicationCard({ application }: { application: Application }) {
  const { id, name, description, resourceIds } = application;

  return (
    <Link
      to={`/applications/${id}`}
      className="rounded-xl outline-none hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 active:shadow-none"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            <span className="block truncate" title={name}>
              {name}
            </span>
          </CardTitle>
          <CardDescription>
            {description === undefined ? (
              "No description"
            ) : (
              <span className="line-clamp-2" title={description}>
                {description}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <span className="tabular-nums">
            {resourceIds.length} {resourceIds.length === 1 ? "resource" : "resources"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
