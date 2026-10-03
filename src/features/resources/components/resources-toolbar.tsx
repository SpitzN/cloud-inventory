import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * The bar above the Resources table: the search, the filters given as children, "Clear filters"
 * while anything is active, and the count of rows shown.
 */
export function ResourcesToolbar({
  search,
  onSearchChange,
  isFiltered,
  onClearFilters,
  shownCount,
  totalCount,
  children,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  isFiltered: boolean;
  onClearFilters: () => void;
  shownCount: number;
  totalCount: number;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="search"
        placeholder="Search by name"
        aria-label="Search by name"
        className="w-64"
        value={search}
        onChange={(event) => {
          onSearchChange(event.target.value);
        }}
      />
      {children}
      {isFiltered && (
        <Button variant="ghost" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
      <span className="text-sm text-muted-foreground tabular-nums">
        {shownCount} of {totalCount}
      </span>
    </div>
  );
}
