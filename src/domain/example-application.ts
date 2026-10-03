import type { Application } from "@/domain/application";

/**
 * The Application a first run starts with. Its id is fixed, so its address is the same on every
 * first run.
 */
export const exampleApplication: Application = {
  id: "data-platform",
  name: "Data Platform",
  description: "Analytics warehouse, pipelines and notebooks",
  resourceIds: ["r-006", "r-007", "r-008", "r-009", "r-005"],
};
