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

/**
 * An Application's Members as a table, in the order given. The row whose id is
 * `highlightedResourceId` is shown highlighted. Each row can take keyboard focus, and
 * `onResourceHover` is called with a row's Resource id when the pointer enters it or it takes
 * focus, and with `undefined` when the pointer leaves or focus moves away.
 */
export function MemberTable({
  resources,
  highlightedResourceId,
  onResourceHover,
}: {
  resources: readonly Resource[];
  highlightedResourceId: string | undefined;
  onResourceHover: (resourceId: string | undefined) => void;
}) {
  return (
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
              tabIndex={0}
              onMouseEnter={() => {
                onResourceHover(id);
              }}
              onMouseLeave={() => {
                onResourceHover(undefined);
              }}
              onFocus={() => {
                onResourceHover(id);
              }}
              onBlur={() => {
                onResourceHover(undefined);
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
                <span className="tabular-nums">{openIssues}</span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
