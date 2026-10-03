import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Application } from "@/domain/application";
import { criticalityTone, mostCritical } from "@/domain/criticality";
import { resourcesWithIds } from "@/domain/dataset";

export function ApplicationCard({ application }: { application: Application }) {
  const { id, name, description, resourceIds } = application;
  const members = resourcesWithIds(resourceIds);
  const openIssues = members.reduce((sum, member) => sum + member.openIssues, 0);
  const criticality = mostCritical(members.map((member) => member.criticality));

  return (
    <Link
      to={`/applications/${id}`}
      className="rounded-xl transition outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="min-w-0">
            <span className="block truncate" title={name}>
              {name}
            </span>
          </CardTitle>
          <CardDescription className="min-w-0">
            {description === undefined ? (
              "No description"
            ) : (
              <span className="line-clamp-2 wrap-break-word" title={description}>
                {description}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="flex items-center gap-2">
            <span className="flex-1 whitespace-nowrap tabular-nums">
              {members.length} {members.length === 1 ? "resource" : "resources"}
              {members.length > 0 && (
                <>
                  <span className="text-muted-foreground"> · </span>
                  <span className={openIssues === 0 ? "text-muted-foreground" : undefined}>
                    {openIssues} {openIssues === 1 ? "open issue" : "open issues"}
                  </span>
                </>
              )}
            </span>
            {criticality !== undefined && (
              <Badge variant={criticalityTone(criticality)}>
                <span className="sr-only">Most critical member: </span>
                {criticality}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
