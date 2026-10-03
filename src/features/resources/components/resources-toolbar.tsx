import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelectionStore } from "@/features/resources/stores/selection";

/**
 * The bar above the Resources table: the search, the filters given as children, "Clear filters"
 * while anything is active, and the count of rows shown. At the right, the Selection count and its
 * "Clear" while a row is ticked, then "Create application".
 */
export function ResourcesToolbar({
  search,
  onSearchChange,
  isFiltered,
  onClearFilters,
  shownCount,
  totalCount,
  hiddenSelectedCount,
  children,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  isFiltered: boolean;
  onClearFilters: () => void;
  shownCount: number;
  totalCount: number;
  /** Ticked Resources the search and filters hide. */
  hiddenSelectedCount: number;
  children: ReactNode;
}) {
  const selectedCount = useSelectionStore((state) => state.ids.size);
  const clearSelection = useSelectionStore((state) => state.clear);

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
      <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
        {shownCount} of {totalCount}
      </span>
      <div className="ml-auto flex items-center gap-2">
        {selectedCount > 0 && (
          <>
            <span className="text-sm whitespace-nowrap tabular-nums">
              {selectedCount} selected
              {hiddenSelectedCount > 0 && ` (${hiddenSelectedCount} hidden)`}
            </span>
            <Button variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
          </>
        )}
        <Link to="/applications/new" className={buttonVariants()}>
          Create application
        </Link>
      </div>
    </div>
  );
}
