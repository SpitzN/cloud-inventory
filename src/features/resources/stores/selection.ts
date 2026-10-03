import { create } from "zustand";

interface SelectionStore {
  /** The ticked Resource ids. Held in memory only, so a reload empties the Selection. */
  ids: ReadonlySet<string>;
  toggle: (id: string) => void;
  /** Replaces the Selection with these ids. */
  setMany: (ids: Iterable<string>) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionStore>()((set) => ({
  ids: new Set(),
  toggle: (id) => {
    set(({ ids }) => {
      const next = new Set(ids);
      if (!next.delete(id)) next.add(id);
      return { ids: next };
    });
  },
  setMany: (ids) => {
    set({ ids: new Set(ids) });
  },
  clear: () => {
    set({ ids: new Set() });
  },
}));
