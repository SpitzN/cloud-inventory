import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Application } from "@/domain/application";
import { startingApplications } from "@/features/applications/lib/saved-applications";

interface ApplicationsStore {
  applications: Application[];
  create: (application: Omit<Application, "id">) => Application;
  remove: (id: string) => void;
}

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
