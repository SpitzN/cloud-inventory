import { z } from "zod";
import { ResourceSchema } from "@/domain/resource";

const SortColumnSchema = ResourceSchema.keyof().extract(["name", "criticality", "openIssues"]);
const SortDirectionSchema = z.enum(["asc", "desc"]);

/** `sort=<column>.<asc|desc>`, read as a TanStack column sort. */
const SortSchema = z
  .string()
  .transform((value) => value.split("."))
  .pipe(z.tuple([SortColumnSchema, SortDirectionSchema]))
  .transform(([id, direction]) => ({ id, desc: direction === "desc" }));

/**
 * The Resources page's query string. A parameter that is missing, malformed or unknown reads as
 * undefined, and the others still parse.
 */
export const ResourcesAddressSchema = z.object({
  sort: SortSchema.optional().catch(undefined),
});
