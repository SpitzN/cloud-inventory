import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Application } from "@/domain/application";
import { startingApplications } from "@/features/applications/lib/saved-applications";

interface ApplicationsStore {
  /** Newest first. */
  applications: Application[];
  /** Adds an Application with a generated id to the front of the list, and returns it. */
  create: (application: Omit<Application, "id">) => Application;
  /** Removes the Application with this id. Its Resources are not touched. */
  remove: (id: string) => void;
}

/** The Applications, saved in localStorage under one versioned key and read back on load. */
export const useApplicationsStore = create<ApplicationsStore>()(
  persist(
    (set, get) => ({
      applications: startingApplications(undefined),
      create: (application) => {
        const created = { id: crypto.randomUUID(), ...application };
        set({ applications: [created, ...get().applications] });
        return created;
      },
      remove: (id) => {
        set({ applications: get().applications.filter((application) => application.id !== id) });
      },
    }),
    {
      name: "cloud-inventory:applications",
      version: 1,
      // Called with the saved state as unknown, or with undefined when nothing is saved.
      merge: (saved, current) => ({ ...current, applications: startingApplications(saved) }),
    },
  ),
);
