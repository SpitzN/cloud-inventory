import { z } from "zod";
import {
  CriticalitySchema,
  EnvironmentSchema,
  ProviderSchema,
  ResourceSchema,
} from "@/domain/resource";

const SortColumnSchema = ResourceSchema.keyof().extract(["name", "criticality", "openIssues"]);
const SortDirectionSchema = z.enum(["asc", "desc"]);

/** `sort=<column>.<asc|desc>`, read as a TanStack column sort. */
const SortSchema = z
  .string()
  .transform((value) => value.split("."))
  .pipe(z.tuple([SortColumnSchema, SortDirectionSchema]))
  .transform(([id, direction]) => ({ id, desc: direction === "desc" }));

/**
 * A comma-separated list of an enum's values, read in the order of its options. Unknown values are
 * dropped; a list with no known value fails.
 */
function valueListSchema<Value extends string>(options: readonly Value[]) {
  return z
    .string()
    .transform((value) => {
      const given = value.split(",");
      return options.filter((option) => given.includes(option));
    })
    .refine((values) => values.length > 0);
}

/**
 * The Resources page's query string. A parameter that is missing, malformed, empty or unknown reads
 * as undefined, and the others still parse.
 */
export const ResourcesAddressSchema = z.object({
  q: z.string().min(1).optional().catch(undefined),
  provider: valueListSchema(ProviderSchema.options).optional().catch(undefined),
  environment: valueListSchema(EnvironmentSchema.options).optional().catch(undefined),
  criticality: valueListSchema(CriticalitySchema.options).optional().catch(undefined),
  sort: SortSchema.optional().catch(undefined),
});
