import { useState } from "react";

const STORAGE_KEY = "cloud-inventory:sidebar-open";

/** The generated `SidebarProvider` writes a cookie but never reads it back, so this remembers it. */
export function useSidebarOpen() {
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== "false");

  const changeOpen = (next: boolean) => {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return [open, changeOpen] as const;
}
