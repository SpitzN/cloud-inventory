import { z } from "zod";

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
        .max(60, "Use 60 characters or fewer.")
        .refine(
          (name) => !taken.has(comparableName(name)),
          "An application with this name already exists.",
        ),
      description: z.string().trim().max(200, "Use 200 characters or fewer."),
      resourceIds: z.array(z.string()).min(1, "Add at least one resource."),
    })
    .transform(({ description, ...application }) =>
      description === "" ? application : { ...application, description },
    );
}

type ApplicationFormSchema = ReturnType<typeof applicationFormSchema>;

export type ApplicationFormInput = z.input<ApplicationFormSchema>;
export type ApplicationFormValues = z.output<ApplicationFormSchema>;
