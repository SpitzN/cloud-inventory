import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Application } from "@/domain/application";
import { startingApplications } from "@/features/applications/lib/saved-applications";

interface ApplicationsStore {
  /** Newest first. */
  applications: Application[];
}

/** The Applications, saved in localStorage under one versioned key and read back on load. */
export const useApplicationsStore = create<ApplicationsStore>()(
  persist(() => ({ applications: startingApplications(undefined) }), {
    name: "cloud-inventory:applications",
    version: 1,
    // Called with the saved state as unknown, or with undefined when nothing is saved.
    merge: (saved, current) => ({ ...current, applications: startingApplications(saved) }),
  }),
);
