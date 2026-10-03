import { criticalityRank } from "@/domain/criticality";
import { resourcesWithIds } from "@/domain/dataset";
import type { Resource } from "@/domain/resource";

export function compareResourcesByName(a: Resource, b: Resource) {
  return a.name.localeCompare(b.name);
}

export function compareResourcesByCriticalityThenOpenIssues(a: Resource, b: Resource) {
  return (
    criticalityRank(a.criticality) - criticalityRank(b.criticality) || a.openIssues - b.openIssues
  );
}

export function compareResourcesInDefaultOrder(a: Resource, b: Resource) {
  return compareResourcesByCriticalityThenOpenIssues(b, a) || compareResourcesByName(a, b);
}

export function resourcesInDefaultOrder(ids: Iterable<string>) {
  return resourcesWithIds(ids).sort(compareResourcesInDefaultOrder);
}
