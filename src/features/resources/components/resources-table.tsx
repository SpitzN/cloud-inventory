import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import { ToneBadge } from "@/components/tone-badge";
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
import { resources } from "@/domain/dataset";
import type { Resource } from "@/domain/resource";
import { compareResourcesInDefaultOrder } from "@/domain/resource-order";

// Nothing is registered yet: sorting, filtering, faceting and row selection arrive with their
// tickets. Until sorting does, the rows are handed over already in the default order.
const features = tableFeatures({});

const columnHelper = createColumnHelper<typeof features, Resource>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    // On a plain element: a table cell in an auto-width table grows past its max width.
    cell: ({ getValue }) => (
      <span title={getValue()} className="block max-w-48 truncate">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("type", { header: "Type" }),
  columnHelper.accessor("provider", {
    header: "Provider",
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  columnHelper.accessor("environment", {
    header: "Environment",
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  columnHelper.accessor("criticality", {
    header: "Criticality",
    cell: ({ getValue }) => <ToneBadge tone={criticalityTone(getValue())}>{getValue()}</ToneBadge>,
  }),
  columnHelper.accessor("openIssues", { header: "Open issues" }),
]);

const rowsInDefaultOrder = resources.toSorted(compareResourcesInDefaultOrder);

/** Every Resource, one row each, with its name, Type, Provider, Environment, Criticality and open issues. */
export function ResourcesTable() {
  const table = useTable({
    features,
    columns,
    data: rowsInDefaultOrder,
    getRowId: ({ id }) => id,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn(header.column.id === "openIssues" && "text-right")}
              >
                <table.FlexRender header={header} />
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(cell.column.id === "openIssues" && "text-right tabular-nums")}
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
