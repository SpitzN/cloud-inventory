import {
  createColumnHelper,
  createSortedRowModel,
  functionalUpdate,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortDirection,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useSearchParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  compareResourcesByCriticalityThenOpenIssues,
  compareResourcesByName,
} from "@/domain/resource-order";
import {
  parseResourcesAddress,
  serialiseResourcesAddress,
} from "@/features/resources/lib/resources-address";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, Resource>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    sortFn: ({ original: a }, { original: b }) => compareResourcesByName(a, b),
    // On a plain element: a table cell in an auto-width table grows past its max width.
    cell: ({ getValue }) => (
      <span title={getValue()} className="block max-w-48 truncate">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("type", { header: "Type", enableSorting: false }),
  columnHelper.accessor("provider", {
    header: "Provider",
    enableSorting: false,
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  columnHelper.accessor("environment", {
    header: "Environment",
    enableSorting: false,
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  columnHelper.accessor("criticality", {
    header: "Criticality",
    sortDescFirst: true,
    // Open issues break ties so that most critical first is the default order of Resources
    // (compareResourcesInDefaultOrder); rows equal on both stay in name order.
    sortFn: ({ original: a }, { original: b }) => compareResourcesByCriticalityThenOpenIssues(a, b),
    cell: ({ getValue }) => <Badge variant={criticalityTone(getValue())}>{getValue()}</Badge>,
  }),
  columnHelper.accessor("openIssues", {
    header: "Open issues",
    sortDescFirst: true,
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
]);

function columnAlign(columnId: string) {
  return columnId === "openIssues" ? "end" : "start";
}

const ARIA_SORT = { asc: "ascending", desc: "descending" } as const;

function ariaSort(direction: SortDirection | false) {
  return direction ? ARIA_SORT[direction] : "none";
}

function SortIndicator({ direction }: { direction: SortDirection | false }) {
  if (direction === "asc") return <ArrowUpIcon data-icon="inline-end" />;
  if (direction === "desc") return <ArrowDownIcon data-icon="inline-end" />;
  return null;
}

// The sorted row model falls back to data order for ties, so every sort breaks ties by name.
const rowsByName = resources.toSorted(compareResourcesByName);

export function ResourcesTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sorting } = parseResourcesAddress(searchParams);

  const table = useTable({
    features,
    columns,
    data: rowsByName,
    getRowId: ({ id }) => id,
    state: { sorting },
    onSortingChange: (updater) => {
      setSearchParams(serialiseResourcesAddress({ sorting: functionalUpdate(updater, sorting) }), {
        replace: true,
      });
    },
    enableMultiSort: false,
    enableSortingRemoval: false,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                align={columnAlign(header.column.id)}
                aria-sort={
                  header.column.getCanSort() ? ariaSort(header.column.getIsSorted()) : undefined
                }
              >
                {header.column.getCanSort() ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-mx-2"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <table.FlexRender header={header} />
                    <SortIndicator direction={header.column.getIsSorted()} />
                  </Button>
                ) : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id} align={columnAlign(cell.column.id)}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
