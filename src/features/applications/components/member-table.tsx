import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { criticalityTone } from "@/domain/criticality";
import type { Resource } from "@/domain/resource";

export function MemberTable({
  resources,
  highlightedResourceId,
  onResourceHover,
  onResourceFocus,
}: {
  resources: readonly Resource[];
  highlightedResourceId: string | undefined;
  onResourceHover: (resourceId: string | undefined) => void;
  onResourceFocus: (resourceId: string | undefined) => void;
}) {
  return (
    <div className="-mx-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Criticality</TableHead>
            <TableHead align="end">Open issues</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <span className="block text-center text-muted-foreground">No member resources</span>
              </TableCell>
            </TableRow>
          ) : (
            resources.map(({ id, name, type, criticality, openIssues }) => (
              <TableRow
                key={id}
                highlighted={id === highlightedResourceId}
                focusable
                tabIndex={0}
                onMouseEnter={() => {
                  onResourceHover(id);
                }}
                onMouseLeave={() => {
                  onResourceHover(undefined);
                }}
                onFocus={() => {
                  onResourceFocus(id);
                }}
                onBlur={() => {
                  onResourceFocus(undefined);
                }}
              >
                <TableCell>
                  <span className="block max-w-48 truncate" title={name}>
                    {name}
                  </span>
                </TableCell>
                <TableCell>{type}</TableCell>
                <TableCell>
                  <Badge variant={criticalityTone(criticality)}>{criticality}</Badge>
                </TableCell>
                <TableCell align="end">
                  <span
                    className={
                      openIssues === 0 ? "text-muted-foreground tabular-nums" : "tabular-nums"
                    }
                  >
                    {openIssues}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
