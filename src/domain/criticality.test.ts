import { describe, expect, it } from "vitest";
import { compareCriticality, criticalityRank } from "@/domain/criticality";
import type { Criticality } from "@/domain/resource";

describe("criticalityRank", () => {
  it("orders the levels low, medium, high, critical", () => {
    expect(criticalityRank("low")).toBeLessThan(criticalityRank("medium"));
    expect(criticalityRank("medium")).toBeLessThan(criticalityRank("high"));
    expect(criticalityRank("high")).toBeLessThan(criticalityRank("critical"));
  });
});

describe("compareCriticality", () => {
  it("sorts the most critical first", () => {
    const levels: Criticality[] = ["medium", "critical", "low", "high"];

    expect(levels.toSorted(compareCriticality)).toEqual(["critical", "high", "medium", "low"]);
  });

  it("treats equal levels as a tie", () => {
    expect(compareCriticality("high", "high")).toBe(0);
  });
});
