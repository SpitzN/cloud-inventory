import { describe, expect, it } from "vitest";
import { resources } from "@/domain/dataset";
import { compareResourcesInDefaultOrder } from "@/domain/resource-order";

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
