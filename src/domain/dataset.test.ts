import { describe, expect, it } from "vitest";
import { resourceById, resources } from "@/domain/dataset";
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
});
