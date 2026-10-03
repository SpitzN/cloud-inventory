import { z } from "zod";
import { ApplicationSchema } from "@/domain/application";

/** The Applications store's state as it is saved in localStorage. */
export const SavedApplicationsSchema = z.object({ applications: z.array(ApplicationSchema) });
