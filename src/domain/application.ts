import { z } from "zod";

export const ApplicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  // The Members, as Resource ids. Membership is recorded here only, never on the Resource.
  resourceIds: z.array(z.string()),
});

export type Application = z.infer<typeof ApplicationSchema>;
