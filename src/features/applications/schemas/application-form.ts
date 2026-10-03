import { z } from "zod";

export const NAME_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 200;

function comparableName(name: string) {
  return name.trim().toLowerCase();
}

export function applicationFormSchema(namesInUse: readonly string[]) {
  const taken = new Set(namesInUse.map(comparableName));

  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Enter a name.")
        .max(NAME_MAX_LENGTH, `Use ${NAME_MAX_LENGTH} characters or fewer.`)
        .refine(
          (name) => !taken.has(comparableName(name)),
          "An application with this name already exists.",
        ),
      description: z
        .string()
        .trim()
        .max(DESCRIPTION_MAX_LENGTH, `Use ${DESCRIPTION_MAX_LENGTH} characters or fewer.`),
      resourceIds: z.array(z.string()).min(1, "Add at least one resource."),
    })
    .transform(({ description, ...application }) =>
      description === "" ? application : { ...application, description },
    );
}

type ApplicationFormSchema = ReturnType<typeof applicationFormSchema>;

export type ApplicationFormInput = z.input<ApplicationFormSchema>;
export type ApplicationFormValues = z.output<ApplicationFormSchema>;
