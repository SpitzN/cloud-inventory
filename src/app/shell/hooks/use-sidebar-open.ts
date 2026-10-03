import { useState } from "react";

const STORAGE_KEY = "cloud-inventory:sidebar-open";

/**
 * Whether the sidebar is expanded, remembered in localStorage across reloads. Expanded on the
 * first visit. The generated `SidebarProvider` writes a cookie but never reads it back, so the
 * shell controls it with this instead.
 */
export function useSidebarOpen() {
  const [open, setOpen] = useState(() => localStorage.getItem(STORAGE_KEY) !== "false");

  const changeOpen = (next: boolean) => {
    setOpen(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return [open, changeOpen] as const;
}
