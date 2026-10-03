import { describe, expect, it } from "vitest";
import { resources } from "@/domain/dataset";
import type { Resource } from "@/domain/resource";
import {
  compareResourcesByCriticalityThenOpenIssues,
  compareResourcesByName,
  compareResourcesInDefaultOrder,
  resourceIdsInDefaultOrder,
} from "@/domain/resource-order";

describe("compareResourcesInDefaultOrder", () => {
  it("puts the most critical first, then the most open issues, then the name", () => {
    const names = resources.toSorted(compareResourcesInDefaultOrder).map(({ name }) => name);

    expect(names).toEqual([
      "payments-api-prod",
      "payments-ledger-db",
      "identity-sso-gateway",
      "ci-deploy-role",
      "analytics-warehouse",
      "identity-users-db",
      "identity-sync-job",
      "payments-api-staging",
      "analytics-raw-events-archive-bucket",
      "analytics-etl-runner",
      "analytics-notebooks-dev",
      "payments-api-dev",
    ]);
  });
});

describe("compareResourcesByName", () => {
  it("puts names in ascending order", () => {
    const names = resources.toSorted(compareResourcesByName).map(({ name }) => name);

    expect(names).toEqual(names.toSorted((a, b) => a.localeCompare(b)));
    expect(names[0]).toBe("analytics-etl-runner");
  });
});

describe("compareResourcesByCriticalityThenOpenIssues", () => {
  it("puts the least critical first, then the fewest open issues, and ties the rest", () => {
    const low: Resource = {
      id: "r",
      name: "r",
      type: "EC2 Instance",
      provider: "AWS",
      region: "us-east-1",
      environment: "production",
      criticality: "low",
      owner: "o",
      tags: [],
      openIssues: 3,
    };
    const medium: Resource = { ...low, criticality: "medium", openIssues: 0 };

    expect(compareResourcesByCriticalityThenOpenIssues(low, medium)).toBeLessThan(0);
    expect(
      compareResourcesByCriticalityThenOpenIssues(low, { ...low, openIssues: 4 }),
    ).toBeLessThan(0);
    expect(compareResourcesByCriticalityThenOpenIssues(low, { ...low, name: "zzz" })).toBe(0);
  });

  it("reversed, then by name, is the default order", () => {
    const reversedThenByName = resources.toSorted(
      (a, b) => compareResourcesByCriticalityThenOpenIssues(b, a) || compareResourcesByName(a, b),
    );

    expect(reversedThenByName).toEqual(resources.toSorted(compareResourcesInDefaultOrder));
  });
});

describe("resourceIdsInDefaultOrder", () => {
  it("lists the ids in the default order of their Resources", () => {
    // payments-api-dev, ci-deploy-role, payments-api-prod
    expect(resourceIdsInDefaultOrder(new Set(["r-003", "r-005", "r-001"]))).toEqual([
      "r-001",
      "r-005",
      "r-003",
    ]);
  });

  it("leaves out an id with no Resource", () => {
    expect(resourceIdsInDefaultOrder(["r-999", "r-001"])).toEqual(["r-001"]);
  });

  it("lists nothing for no ids", () => {
    expect(resourceIdsInDefaultOrder([])).toEqual([]);
  });
});
