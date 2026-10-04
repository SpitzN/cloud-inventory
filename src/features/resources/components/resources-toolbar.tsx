import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelectionStore } from "@/features/resources/stores/selection";

export function ResourcesToolbar({
  search,
  onSearchChange,
  isFiltered,
  onClearFilters,
  shownCount,
  totalCount,
  hiddenSelectedCount,
  children,
  actions,
}: {
  search: string;
  onSearchChange: (search: string) => void;
  isFiltered: boolean;
  onClearFilters: () => void;
  shownCount: number;
  totalCount: number;
  hiddenSelectedCount: number;
  children: ReactNode;
  actions: ReactNode;
}) {
  const selectedCount = useSelectionStore((state) => state.ids.size);
  const clearSelection = useSelectionStore((state) => state.clear);

  return (
    <div className="flex items-start gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Input
          type="search"
          placeholder="Search by name"
          aria-label="Search by name"
          className="w-64 shrink-0"
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
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
        {actions}
      </div>
    </div>
  );
}
