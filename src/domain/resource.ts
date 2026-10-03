import { z } from "zod";

export const ProviderSchema = z.enum(["AWS", "GCP", "Azure"]);
export const EnvironmentSchema = z.enum(["production", "staging", "development"]);
// Ordered from least to most critical: the order is the Criticality rank.
export const CriticalitySchema = z.enum(["low", "medium", "high", "critical"]);

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  provider: ProviderSchema,
  region: z.string(),
  environment: EnvironmentSchema,
  criticality: CriticalitySchema,
  owner: z.string(),
  tags: z.array(z.string()),
  openIssues: z.number().int().nonnegative(),
});

export type Provider = z.infer<typeof ProviderSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type Criticality = z.infer<typeof CriticalitySchema>;
export type Resource = z.infer<typeof ResourceSchema>;
