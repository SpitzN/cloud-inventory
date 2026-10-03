import { compareCriticality } from "@/domain/criticality";
import type { Resource } from "@/domain/resource";

/**
 * A sort comparator for the default order of Resources: most critical first, then most open
 * issues, then name ascending.
 */
export function compareResourcesInDefaultOrder(a: Resource, b: Resource) {
  return (
    compareCriticality(a.criticality, b.criticality) ||
    b.openIssues - a.openIssues ||
    a.name.localeCompare(b.name)
  );
}
