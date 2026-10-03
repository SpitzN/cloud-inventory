import { describe, expect, it } from "vitest";
import { ApplicationSchema } from "@/domain/application";
import { exampleApplication, resourceById, resources, resourcesWithIds } from "@/domain/dataset";
import { ResourceSchema } from "@/domain/resource";

describe("the dataset", () => {
  it("holds twelve Resources that all pass the Resource schema", () => {
    expect(resources).toHaveLength(12);

    for (const resource of resources) {
      expect(ResourceSchema.parse(resource)).toEqual(resource);
    }
  });

  it("gives every Resource its own id", () => {
    const ids = new Set(resources.map((resource) => resource.id));

    expect(ids.size).toBe(resources.length);
  });

  it("finds a Resource by its id, and nothing for an unknown id", () => {
    expect(resourceById("r-005")?.name).toBe("ci-deploy-role");
    expect(resourceById("r-999")).toBeUndefined();
  });

  it("finds Resources by their ids in the order given, leaving out unknown ids", () => {
    expect(resourcesWithIds(["r-005", "r-999", "r-001"]).map(({ name }) => name)).toEqual([
      "ci-deploy-role",
      "payments-api-prod",
    ]);
  });

  it("holds an example Application that passes its schema and whose Members all exist", () => {
    expect(ApplicationSchema.parse(exampleApplication)).toEqual(exampleApplication);
    expect(exampleApplication.resourceIds).toEqual(["r-006", "r-007", "r-008", "r-009", "r-005"]);

    for (const id of exampleApplication.resourceIds) {
      expect(resourceById(id)).toBeDefined();
    }
  });
});
