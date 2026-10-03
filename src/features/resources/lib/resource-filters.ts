import { constructFilterFn } from "@tanstack/react-table";
import {
  SearchFilterSchema,
  ValuesFilterSchema,
} from "@/features/resources/schemas/column-filters";

export function matchesSearch(name: string, search: string) {
  return name.toLowerCase().includes(search.trim().toLowerCase());
}

export function matchesAnyValue(value: string, ticked: readonly string[]) {
  return ticked.length === 0 || ticked.includes(value);
}

export const searchFilterFn = constructFilterFn({
  filter: matchesSearch,
  resolveFilterValue: (search) => SearchFilterSchema.parse(search),
  autoRemove: (search) => search === "",
});

export const valuesFilterFn = constructFilterFn({
  filter: matchesAnyValue,
  resolveFilterValue: (ticked) => ValuesFilterSchema.parse(ticked),
  autoRemove: (ticked) => Array.isArray(ticked) && ticked.length === 0,
});
