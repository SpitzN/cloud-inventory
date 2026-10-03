import {
  columnFacetingFeature,
  columnFilteringFeature,
  createColumnHelper,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createSortedRowModel,
  functionalUpdate,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortDirection,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
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
import {
  CriticalitySchema,
  EnvironmentSchema,
  ProviderSchema,
  type Resource,
} from "@/domain/resource";
import {
  compareResourcesByCriticalityThenOpenIssues,
  compareResourcesByName,
} from "@/domain/resource-order";
import { ValueFilter } from "@/features/resources/components/value-filter";
import { searchFilterFn, valuesFilterFn } from "@/features/resources/lib/resource-filters";
import {
  parseResourcesAddress,
  readColumnFilters,
  serialiseResourcesAddress,
  type ResourcesAddress,
} from "@/features/resources/lib/resources-address";

const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, Resource>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    filterFn: searchFilterFn,
    sortFn: ({ original: a }, { original: b }) => compareResourcesByName(a, b),
    // On a plain element: a table cell in an auto-width table grows past its max width.
    cell: ({ getValue }) => (
      <span title={getValue()} className="block max-w-48 truncate">
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Type",
    enableSorting: false,
    enableColumnFilter: false,
  }),
  columnHelper.accessor("provider", {
    header: "Provider",
    enableSorting: false,
    filterFn: valuesFilterFn,
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  columnHelper.accessor("environment", {
    header: "Environment",
    enableSorting: false,
    filterFn: valuesFilterFn,
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  columnHelper.accessor("criticality", {
    header: "Criticality",
    sortDescFirst: true,
    filterFn: valuesFilterFn,
    // Open issues break ties so that most critical first is the default order of Resources
    // (compareResourcesInDefaultOrder); rows equal on both stay in name order.
    sortFn: ({ original: a }, { original: b }) => compareResourcesByCriticalityThenOpenIssues(a, b),
    cell: ({ getValue }) => <Badge variant={criticalityTone(getValue())}>{getValue()}</Badge>,
  }),
  columnHelper.accessor("openIssues", {
    header: "Open issues",
    sortDescFirst: true,
    enableColumnFilter: false,
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
]);

const VALUE_FILTERS = [
  { columnId: "provider", title: "Provider", options: ProviderSchema.options },
  { columnId: "environment", title: "Environment", options: EnvironmentSchema.options },
  { columnId: "criticality", title: "Criticality", options: CriticalitySchema.options },
] as const;

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

function NoMatchesRow({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <TableRow>
      <TableCell colSpan={columns.length}>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No resources match your search and filters.</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          </EmptyContent>
        </Empty>
      </TableCell>
    </TableRow>
  );
}

// The sorted row model falls back to data order for ties, so every sort breaks ties by name.
const rowsByName = resources.toSorted(compareResourcesByName);

export function ResourcesTable() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sorting, columnFilters } = parseResourcesAddress(searchParams);
  const filters = readColumnFilters(columnFilters);

  function writeAddress(address: ResourcesAddress) {
    // Not setSearchParams, which escapes the filters' commas. Replace, so Back skips keystrokes.
    void navigate(
      { search: serialiseResourcesAddress(address) },
      { replace: true, flushSync: true },
    );
  }

  const table = useTable({
    features,
    columns,
    data: rowsByName,
    getRowId: ({ id }) => id,
    state: { sorting, columnFilters },
    onSortingChange: (updater) => {
      writeAddress({ sorting: functionalUpdate(updater, sorting), columnFilters });
    },
    onColumnFiltersChange: (updater) => {
      writeAddress({ sorting, columnFilters: functionalUpdate(updater, columnFilters) });
    },
    enableMultiSort: false,
    enableSortingRemoval: false,
  });

  const { rows } = table.getRowModel();

  function clearFilters() {
    table.resetColumnFilters(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          type="search"
          placeholder="Search by name"
          aria-label="Search by name"
          className="w-64"
          value={filters.name ?? ""}
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);
          }}
        />
        {VALUE_FILTERS.map(({ columnId, title, options }) => {
          const column = table.getColumn(columnId);
          const counts = column?.getFacetedUniqueValues();
          return (
            <ValueFilter
              key={columnId}
              title={title}
              options={options.map((value) => ({ value, count: counts?.get(value) ?? 0 }))}
              ticked={filters[columnId] ?? []}
              onTickedChange={(ticked) => {
                column?.setFilterValue(ticked);
              }}
            />
          );
        })}
        {columnFilters.length > 0 && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
        <span className="text-sm text-muted-foreground tabular-nums">
          {rows.length} of {rowsByName.length}
        </span>
      </div>
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
          {rows.length === 0 ? (
            <NoMatchesRow onClearFilters={clearFilters} />
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} align={columnAlign(cell.column.id)}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
