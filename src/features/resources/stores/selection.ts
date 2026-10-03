import { create } from "zustand";

interface SelectionStore {
  /** In memory only, so a reload empties the Selection. */
  ids: ReadonlySet<string>;
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
