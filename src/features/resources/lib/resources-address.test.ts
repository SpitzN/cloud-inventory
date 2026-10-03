import { describe, expect, it } from "vitest";
import {
  DEFAULT_SORTING,
  parseResourcesAddress,
  readColumnFilters,
  serialiseResourcesAddress,
} from "@/features/resources/lib/resources-address";

function parse(query: string) {
  return parseResourcesAddress(new URLSearchParams(query));
}

function roundTrip(query: string) {
  return serialiseResourcesAddress(parse(query));
}

describe("the Resources address codec, sort", () => {
  it.each([
    ["sort=name.asc", { id: "name", desc: false }],
    ["sort=name.desc", { id: "name", desc: true }],
    ["sort=criticality.asc", { id: "criticality", desc: false }],
    ["sort=openIssues.desc", { id: "openIssues", desc: true }],
    ["sort=openIssues.asc", { id: "openIssues", desc: false }],
  ])("round-trips %s", (query, columnSort) => {
    expect(parse(query).sorting).toEqual([columnSort]);
    expect(roundTrip(query)).toBe(query);
  });

  it("sorts most critical first when the address names no sort", () => {
    expect(parse("").sorting).toEqual([{ id: "criticality", desc: true }]);
    expect(DEFAULT_SORTING).toEqual([{ id: "criticality", desc: true }]);
  });

  it("omits the sort at its default", () => {
    expect(serialiseResourcesAddress({ sorting: DEFAULT_SORTING, columnFilters: [] })).toBe("");
    expect(roundTrip("sort=criticality.desc")).toBe("");
  });

  it("omits the sort when the table holds none", () => {
    expect(serialiseResourcesAddress({ sorting: [], columnFilters: [] })).toBe("");
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
});

describe("the Resources address codec, search and filters", () => {
  it.each([
    ["q=payments", [{ id: "name", value: "payments" }]],
    ["q=+role+", [{ id: "name", value: " role " }]],
    ["provider=AWS", [{ id: "provider", value: ["AWS"] }]],
    ["provider=AWS,GCP", [{ id: "provider", value: ["AWS", "GCP"] }]],
    ["environment=production", [{ id: "environment", value: ["production"] }]],
    ["environment=staging,development", [{ id: "environment", value: ["staging", "development"] }]],
    ["criticality=high,critical", [{ id: "criticality", value: ["high", "critical"] }]],
  ])("round-trips %s", (query, columnFilters) => {
    expect(parse(query).columnFilters).toEqual(columnFilters);
    expect(roundTrip(query)).toBe(query);
  });

  it("round-trips every parameter at once", () => {
    const query =
      "q=db&provider=AWS,Azure&environment=production&criticality=critical&sort=name.asc";
    const address = parse(query);

    expect(address).toEqual({
      sorting: [{ id: "name", desc: false }],
      columnFilters: [
        { id: "name", value: "db" },
        { id: "provider", value: ["AWS", "Azure"] },
        { id: "environment", value: ["production"] },
        { id: "criticality", value: ["critical"] },
      ],
    });
    expect(serialiseResourcesAddress(address)).toBe(query);
  });

  it("writes the filters' commas as commas", () => {
    expect(
      serialiseResourcesAddress({
        sorting: DEFAULT_SORTING,
        columnFilters: [{ id: "provider", value: ["AWS", "GCP"] }],
      }),
    ).toBe("provider=AWS,GCP");
  });

  it("reads the values of a filter in the order of its options", () => {
    expect(parse("criticality=critical,high").columnFilters).toEqual([
      { id: "criticality", value: ["high", "critical"] },
    ]);
    expect(parse("provider=GCP,AWS,GCP").columnFilters).toEqual([
      { id: "provider", value: ["AWS", "GCP"] },
    ]);
  });

  it("holds no filters when the address names none", () => {
    expect(parse("").columnFilters).toEqual([]);
  });

  it.each(["q=", "provider=", "environment=", "criticality=", "provider=,"])(
    "omits the empty value in %s",
    (query) => {
      expect(parse(query).columnFilters).toEqual([]);
      expect(roundTrip(query)).toBe("");
    },
  );

  it("omits a search or a filter the table holds empty", () => {
    expect(
      serialiseResourcesAddress({
        sorting: DEFAULT_SORTING,
        columnFilters: [
          { id: "name", value: "" },
          { id: "provider", value: [] },
        ],
      }),
    ).toBe("");
  });

  it("applies the valid values of a filter and drops the unknown ones", () => {
    expect(parse("provider=AWS,Oracle").columnFilters).toEqual([
      { id: "provider", value: ["AWS"] },
    ]);
    expect(roundTrip("provider=AWS,Oracle")).toBe("provider=AWS");
  });

  it.each([
    "criticality=urgent",
    "criticality=Critical",
    "provider=aws",
    "environment=prod",
    "provider=Oracle,IBM",
  ])("ignores %s", (query) => {
    expect(parse(query).columnFilters).toEqual([]);
  });

  it("keeps the valid parameters beside a malformed one", () => {
    const address = parse("criticality=urgent&provider=GCP&sort=name.sideways&q=analytics");

    expect(address).toEqual({
      sorting: DEFAULT_SORTING,
      columnFilters: [
        { id: "name", value: "analytics" },
        { id: "provider", value: ["GCP"] },
      ],
    });
  });

  it("reads its parameters when the address also holds ones it does not know", () => {
    expect(parse("utm=x&provider=Azure&page=2").columnFilters).toEqual([
      { id: "provider", value: ["Azure"] },
    ]);
  });

  it("writes only the parameters it owns", () => {
    expect(roundTrip("utm=x&q=db&sort=name.desc")).toBe("q=db&sort=name.desc");
  });
});

describe("reading the table's column filters", () => {
  it("gives each filter its typed values", () => {
    expect(
      readColumnFilters([
        { id: "name", value: "db" },
        { id: "criticality", value: ["low", "high"] },
      ]),
    ).toEqual({ name: "db", criticality: ["low", "high"] });
  });

  it("drops a filter whose value does not parse, and columns it does not know", () => {
    expect(
      readColumnFilters([
        { id: "name", value: 3 },
        { id: "provider", value: ["Oracle"] },
        { id: "openIssues", value: [1] },
        { id: "environment", value: ["staging"] },
      ]),
    ).toEqual({ environment: ["staging"] });
  });
});
