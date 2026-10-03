import { zodResolver } from "@hookform/resolvers/zod";
import { useId, type ReactNode } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ResourceCombobox } from "@/features/applications/components/resource-combobox";
import {
  applicationFormSchema,
  type ApplicationFormInput,
  type ApplicationFormValues,
} from "@/features/applications/schemas/application-form";

export function ApplicationForm({
  startingValues,
  namesInUse,
  onSubmit,
  onCancel,
  preview,
}: {
  startingValues: ApplicationFormInput;
  namesInUse: readonly string[];
  onSubmit: (application: ApplicationFormValues) => void;
  onCancel: () => void;
  preview: (control: Control<ApplicationFormInput, unknown, ApplicationFormValues>) => ReactNode;
}) {
  const id = useId();
  const { control, handleSubmit } = useForm<ApplicationFormInput, unknown, ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema(namesInUse)),
    defaultValues: startingValues,
  });

  return (
    <>
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
      >
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
                <Input
                  {...field}
                  id={`${id}-name`}
                  autoComplete="off"
                  aria-required
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? `${id}-name-error` : undefined}
                />
                <FieldError id={`${id}-name-error`} errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-description`}>
                  Description
                  <span className="font-normal text-muted-foreground">optional</span>
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`${id}-description`}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? `${id}-description-error` : undefined}
                />
                <FieldError id={`${id}-description-error`} errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="resourceIds"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-resources`}>
                  Resources · {field.value.length}
                </FieldLabel>
                <ResourceCombobox
                  ref={field.ref}
                  id={`${id}-resources`}
                  value={field.value}
                  aria-required
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? `${id}-resources-error` : undefined}
                  onValueChange={field.onChange}
                />
                <FieldError id={`${id}-resources-error`} errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex gap-2">
          <Button type="submit">Create application</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
      {preview(control)}
    </>
  );
}
