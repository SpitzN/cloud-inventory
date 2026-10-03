import { criticalityRank } from "@/domain/criticality";
import { resourcesWithIds } from "@/domain/dataset";
import type { Resource } from "@/domain/resource";

/** A sort comparator for Resources by name, ascending. */
export function compareResourcesByName(a: Resource, b: Resource) {
  return a.name.localeCompare(b.name);
}

/**
 * A sort comparator for Resources: least critical first, then fewest open issues. Resources equal
 * on both compare as 0.
 */
export function compareResourcesByCriticalityThenOpenIssues(a: Resource, b: Resource) {
  return (
    criticalityRank(a.criticality) - criticalityRank(b.criticality) || a.openIssues - b.openIssues
  );
}

/**
 * A sort comparator for the default order of Resources: most critical first, then most open
 * issues, then name ascending.
 */
export function compareResourcesInDefaultOrder(a: Resource, b: Resource) {
  return compareResourcesByCriticalityThenOpenIssues(b, a) || compareResourcesByName(a, b);
}

/** The Resources with these ids, in the default order. An id with no Resource is left out. */
export function resourcesInDefaultOrder(ids: Iterable<string>) {
  return resourcesWithIds(ids).sort(compareResourcesInDefaultOrder);
}
