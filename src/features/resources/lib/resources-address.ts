import type { ColumnFiltersState, ColumnSort, SortingState } from "@tanstack/react-table";
import { ResourceColumnFiltersSchema } from "@/features/resources/schemas/column-filters";
import { ResourcesAddressSchema } from "@/features/resources/schemas/resources-address";

export interface ResourcesAddress {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
}

const DEFAULT_SORT = { id: "criticality", desc: true } satisfies ColumnSort;

export const DEFAULT_SORTING: SortingState = [DEFAULT_SORT];

export function parseResourcesAddress(searchParams: URLSearchParams) {
  const { q, provider, environment, criticality, sort } = ResourcesAddressSchema.parse(
    Object.fromEntries(searchParams),
  );
  const columnFilters = Object.entries({ name: q, provider, environment, criticality }).flatMap(
    ([id, value]) => (value === undefined ? [] : [{ id, value }]),
  );
  return { sorting: sort ? [sort] : DEFAULT_SORTING, columnFilters } satisfies ResourcesAddress;
}

export function readColumnFilters(columnFilters: ColumnFiltersState) {
  return ResourceColumnFiltersSchema.parse(
    Object.fromEntries(columnFilters.map(({ id, value }) => [id, value])),
  );
}

export function serialiseResourcesAddress({
  sorting: [columnSort],
  columnFilters,
}: ResourcesAddress) {
  const { name, ...valueFilters } = readColumnFilters(columnFilters);
  const searchParams = new URLSearchParams();
  if (name) searchParams.set("q", name);
  for (const [key, values] of Object.entries(valueFilters)) {
    if (values?.length) searchParams.set(key, values.join(","));
  }
  if (columnSort && (columnSort.id !== DEFAULT_SORT.id || columnSort.desc !== DEFAULT_SORT.desc)) {
    searchParams.set("sort", `${columnSort.id}.${columnSort.desc ? "desc" : "asc"}`);
  }
  // A comma needs no escaping in a query, and the filters read as `provider=AWS,GCP`.
  return searchParams.toString().replaceAll("%2C", ",");
}
