import { z } from "zod";
import { ApplicationSchema } from "@/domain/application";

export const SavedApplicationsSchema = z.object({ applications: z.array(ApplicationSchema) });
