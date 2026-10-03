import { describe, expect, it } from "vitest";
import {
  DEFAULT_SORTING,
  parseResourcesAddress,
  serialiseResourcesAddress,
} from "@/features/resources/lib/resources-address";

function parse(query: string) {
  return parseResourcesAddress(new URLSearchParams(query));
}

describe("the Resources address codec, sort", () => {
  it.each([
    ["sort=name.asc", { id: "name", desc: false }],
    ["sort=name.desc", { id: "name", desc: true }],
    ["sort=criticality.asc", { id: "criticality", desc: false }],
    ["sort=openIssues.desc", { id: "openIssues", desc: true }],
    ["sort=openIssues.asc", { id: "openIssues", desc: false }],
  ])("round-trips %s", (query, columnSort) => {
    const address = parse(query);

    expect(address.sorting).toEqual([columnSort]);
    expect(serialiseResourcesAddress(address).toString()).toBe(query);
  });

  it("sorts most critical first when the address names no sort", () => {
    expect(parse("").sorting).toEqual([{ id: "criticality", desc: true }]);
    expect(DEFAULT_SORTING).toEqual([{ id: "criticality", desc: true }]);
  });

  it("omits the sort at its default", () => {
    expect(serialiseResourcesAddress({ sorting: DEFAULT_SORTING }).toString()).toBe("");
    expect(serialiseResourcesAddress(parse("sort=criticality.desc")).toString()).toBe("");
  });

  it("omits the sort when the table holds none", () => {
    expect(serialiseResourcesAddress({ sorting: [] }).toString()).toBe("");
  });

  it.each([
    "sort=owner.asc",
    "sort=name.sideways",
    "sort=garbage",
    "sort=",
    "sort=name",
    "sort=name.asc.desc",
    "sort=Name.asc",
  ])("drops %s and keeps the default sort", (query) => {
    expect(parse(query).sorting).toEqual(DEFAULT_SORTING);
  });

  it("reads the sort when the address also holds parameters it does not know", () => {
    expect(parse("utm=x&sort=name.desc&page=2").sorting).toEqual([{ id: "name", desc: true }]);
  });

  it("writes only the parameters it owns", () => {
    expect(serialiseResourcesAddress(parse("utm=x&sort=name.desc")).toString()).toBe(
      "sort=name.desc",
    );
  });
});
