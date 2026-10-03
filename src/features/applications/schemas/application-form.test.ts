import { describe, expect, it } from "vitest";
import { applicationFormSchema } from "@/features/applications/schemas/application-form";

const schema = applicationFormSchema(["Data Platform"]);

const valid = { name: "Payments", description: "Card processing", resourceIds: ["r-001"] };

function errorPaths(input: unknown) {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("application form schema", () => {
  it("accepts a valid Application and trims its name and description", () => {
    expect(
      schema.parse({ ...valid, name: "  Payments  ", description: "  Card processing  " }),
    ).toEqual(valid);
  });

  it.each([
    ["empty", ""],
    ["only spaces", "   "],
  ])("requires a name that is not %s", (_, name) => {
    expect(errorPaths({ ...valid, name })).toEqual(["name"]);
  });

  it("allows a name of 60 characters and rejects one of 61", () => {
    expect(errorPaths({ ...valid, name: "a".repeat(60) })).toEqual([]);
    expect(errorPaths({ ...valid, name: "a".repeat(61) })).toEqual(["name"]);
  });

  it("measures the name after trimming", () => {
    expect(errorPaths({ ...valid, name: ` ${"a".repeat(60)} ` })).toEqual([]);
  });

  it.each(["Data Platform", "data platform", "DATA PLATFORM", "  Data Platform  "])(
    "rejects %j, a name already in use",
    (name) => {
      expect(errorPaths({ ...valid, name })).toEqual(["name"]);
    },
  );

  it("ignores surrounding whitespace in the names in use", () => {
    expect(
      applicationFormSchema(["  Payments "]).safeParse({ ...valid, name: "payments" }).success,
    ).toBe(false);
  });

  it("allows a description of 200 characters and rejects one of 201", () => {
    expect(errorPaths({ ...valid, description: "a".repeat(200) })).toEqual([]);
    expect(errorPaths({ ...valid, description: "a".repeat(201) })).toEqual(["description"]);
  });

  it("measures the description after trimming", () => {
    expect(errorPaths({ ...valid, description: `  ${"a".repeat(200)}  ` })).toEqual([]);
  });

  it.each([
    ["empty", ""],
    ["only spaces", "   "],
  ])("leaves out a description that is %s", (_, description) => {
    expect(schema.parse({ ...valid, description })).not.toHaveProperty("description");
  });

  it("requires at least one Member", () => {
    expect(errorPaths({ ...valid, resourceIds: [] })).toEqual(["resourceIds"]);
  });

  it("keeps the Members in the order given", () => {
    const resourceIds = ["r-005", "r-001", "r-004"];

    expect(schema.parse({ ...valid, resourceIds }).resourceIds).toEqual(resourceIds);
  });

  it("reports every invalid field at once", () => {
    expect(errorPaths({ name: "", description: "a".repeat(201), resourceIds: [] })).toEqual([
      "name",
      "description",
      "resourceIds",
    ]);
  });
});
