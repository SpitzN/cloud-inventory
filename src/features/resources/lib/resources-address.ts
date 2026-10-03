import type { ColumnSort, SortingState } from "@tanstack/react-table";
import { ResourcesAddressSchema } from "@/features/resources/schemas/resources-address";

/** The Resources table's state that the address holds. */
interface ResourcesAddress {
  sorting: SortingState;
}

const DEFAULT_SORT = { id: "criticality", desc: true } satisfies ColumnSort;

/** The sort when the address names none: Criticality, most critical first. */
export const DEFAULT_SORTING: SortingState = [DEFAULT_SORT];

/** Reads the table state from the query string. Whatever does not parse falls back to its default. */
export function parseResourcesAddress(searchParams: URLSearchParams) {
  const { sort } = ResourcesAddressSchema.parse(Object.fromEntries(searchParams));
  return { sorting: sort ? [sort] : DEFAULT_SORTING } satisfies ResourcesAddress;
}

/**
 * Writes the table state as a query string holding only the parameters this codec owns, each
 * omitted at its default.
 */
export function serialiseResourcesAddress({ sorting: [columnSort] }: ResourcesAddress) {
  const searchParams = new URLSearchParams();
  if (columnSort && (columnSort.id !== DEFAULT_SORT.id || columnSort.desc !== DEFAULT_SORT.desc)) {
    searchParams.set("sort", `${columnSort.id}.${columnSort.desc ? "desc" : "asc"}`);
  }
  return searchParams;
}
