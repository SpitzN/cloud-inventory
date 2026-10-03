import type { Application } from "@/domain/application";
import { exampleApplication, resourceById } from "@/domain/dataset";
import { SavedApplicationsSchema } from "@/features/applications/schemas/saved-applications";

/**
 * The Applications to start with, from whatever was saved: `undefined` when nothing was. Anything
 * that is not a valid saved list gives the first-run state, the example Application alone, and is
 * not repaired. A valid list, even an empty one, is kept in its order; a Member whose Resource is
 * not in the dataset is dropped, and its Application kept.
 */
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
