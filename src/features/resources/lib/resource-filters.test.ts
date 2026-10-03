import { describe, expect, it } from "vitest";
import { matchesAnyValue, matchesSearch } from "@/features/resources/lib/resource-filters";

describe("the multi-value match", () => {
  it("matches every value when nothing is ticked", () => {
    expect(matchesAnyValue("AWS", [])).toBe(true);
    expect(matchesAnyValue("Azure", [])).toBe(true);
  });

  it("matches only the ticked value", () => {
    expect(matchesAnyValue("AWS", ["AWS"])).toBe(true);
    expect(matchesAnyValue("GCP", ["AWS"])).toBe(false);
  });

  it("widens with each value ticked", () => {
    expect(matchesAnyValue("AWS", ["AWS", "GCP"])).toBe(true);
    expect(matchesAnyValue("GCP", ["AWS", "GCP"])).toBe(true);
    expect(matchesAnyValue("Azure", ["AWS", "GCP"])).toBe(false);
  });
});

describe("the search match", () => {
  it.each([
    ["payments-api-prod", "payments"],
    ["payments-api-prod", "Payments"],
    ["payments-ledger-db", "db"],
    ["ci-deploy-role", " role "],
    ["ci-deploy-role", ""],
    ["ci-deploy-role", "   "],
  ])("matches %s for %j", (name, search) => {
    expect(matchesSearch(name, search)).toBe(true);
  });

  it.each([
    ["payments-api-prod", "ledger"],
    ["payments-api-prod", "payments api"],
  ])("does not match %s for %j", (name, search) => {
    expect(matchesSearch(name, search)).toBe(false);
  });
});
