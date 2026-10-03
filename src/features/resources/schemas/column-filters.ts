import { z } from "zod";
import { CriticalitySchema, EnvironmentSchema, ProviderSchema } from "@/domain/resource";

export const SearchFilterSchema = z.string();

export const ValuesFilterSchema = z.array(z.string());

/** TanStack types a filter value as unknown; one that does not parse reads as undefined. */
export const ResourceColumnFiltersSchema = z.object({
  name: SearchFilterSchema.optional().catch(undefined),
  provider: z.array(ProviderSchema).optional().catch(undefined),
  environment: z.array(EnvironmentSchema).optional().catch(undefined),
  criticality: z.array(CriticalitySchema).optional().catch(undefined),
});
