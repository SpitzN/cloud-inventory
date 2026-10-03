import type { Application } from "@/domain/application";
import { exampleApplication, resourceById } from "@/domain/dataset";
import { SavedApplicationsSchema } from "@/features/applications/schemas/saved-applications";

export function startingApplications(saved: unknown): Application[] {
  const parsed = SavedApplicationsSchema.safeParse(saved);

  if (!parsed.success) {
    return [exampleApplication];
  }

  return parsed.data.applications.map((application) => ({
    ...application,
    resourceIds: application.resourceIds.filter((id) => resourceById(id) !== undefined),
  }));
}
