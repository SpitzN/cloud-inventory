import { create } from "zustand";

interface SelectionStore {
  /** The ticked Resource ids. Held in memory only, so a reload empties the Selection. */
  ids: ReadonlySet<string>;
  /** Replaces the Selection with these ids. */
  setMany: (ids: Iterable<string>) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionStore>()((set) => ({
  ids: new Set(),
  setMany: (ids) => {
    set({ ids: new Set(ids) });
  },
  clear: () => {
    set({ ids: new Set() });
  },
}));
