import { z } from "zod";
import {
  CriticalitySchema,
  EnvironmentSchema,
  ProviderSchema,
  ResourceSchema,
} from "@/domain/resource";

const SortColumnSchema = ResourceSchema.keyof().extract(["name", "criticality", "openIssues"]);
const SortDirectionSchema = z.enum(["asc", "desc"]);

const SortSchema = z
  .string()
  .transform((value) => value.split("."))
  .pipe(z.tuple([SortColumnSchema, SortDirectionSchema]))
  .transform(([id, direction]) => ({ id, desc: direction === "desc" }));

function valueListSchema<Value extends string>(options: readonly Value[]) {
  return z
    .string()
    .transform((value) => {
      const given = value.split(",");
      return options.filter((option) => given.includes(option));
    })
    .refine((values) => values.length > 0);
}

export const ResourcesAddressSchema = z.object({
  q: z.string().min(1).optional().catch(undefined),
  provider: valueListSchema(ProviderSchema.options).optional().catch(undefined),
  environment: valueListSchema(EnvironmentSchema.options).optional().catch(undefined),
  criticality: valueListSchema(CriticalitySchema.options).optional().catch(undefined),
  sort: SortSchema.optional().catch(undefined),
});
