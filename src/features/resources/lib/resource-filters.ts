import { constructFilterFn } from "@tanstack/react-table";
import {
  SearchFilterSchema,
  ValuesFilterSchema,
} from "@/features/resources/schemas/column-filters";

/** Whether a name holds the search, ignoring case and the whitespace around the search. */
export function matchesSearch(name: string, search: string) {
  return name.toLowerCase().includes(search.trim().toLowerCase());
}

/** Whether a value is one of the ticked values. With nothing ticked, every value matches. */
export function matchesAnyValue(value: string, ticked: readonly string[]) {
  return ticked.length === 0 || ticked.includes(value);
}

/** The `name` column's filter: the search. An empty search is removed from the table's state. */
export const searchFilterFn = constructFilterFn({
  filter: matchesSearch,
  resolveFilterValue: (search) => SearchFilterSchema.parse(search),
  autoRemove: (search) => search === "",
});

/** A Provider, Environment or Criticality filter. A filter with nothing ticked is removed. */
export const valuesFilterFn = constructFilterFn({
  filter: matchesAnyValue,
  resolveFilterValue: (ticked) => ValuesFilterSchema.parse(ticked),
  autoRemove: (ticked) => Array.isArray(ticked) && ticked.length === 0,
});
