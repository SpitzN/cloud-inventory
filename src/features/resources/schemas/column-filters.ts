import { z } from "zod";
import { CriticalitySchema, EnvironmentSchema, ProviderSchema } from "@/domain/resource";

/** The search: the `name` column's filter value, as typed. */
export const SearchFilterSchema = z.string();

/** The ticked values of a Provider, Environment or Criticality filter. */
export const ValuesFilterSchema = z.array(z.string());

/**
 * The Resources table's column filters by column id. TanStack types a filter value as unknown; a
 * value that does not parse reads as undefined.
 */
export const ResourceColumnFiltersSchema = z.object({
  name: SearchFilterSchema.optional().catch(undefined),
  provider: z.array(ProviderSchema).optional().catch(undefined),
  environment: z.array(EnvironmentSchema).optional().catch(undefined),
  criticality: z.array(CriticalitySchema).optional().catch(undefined),
});
