import { useId } from "react";
import { useWatch, type Control } from "react-hook-form";
import { resourcesWithIds } from "@/domain/dataset";
import { ApplicationGraph } from "@/features/applications/components/graph/application-graph";
import type {
  ApplicationFormInput,
  ApplicationFormValues,
} from "@/features/applications/schemas/application-form";

export function ApplicationPreview({
  control,
}: {
  control: Control<ApplicationFormInput, unknown, ApplicationFormValues>;
}) {
  const headingId = useId();
  const name = useWatch({ control, name: "name" });
  const resourceIds = useWatch({ control, name: "resourceIds" });

  return (
    <section className="flex flex-col gap-2" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-sm font-semibold">
        Preview
      </h2>
      <div className="relative min-h-96 flex-1 overflow-hidden rounded-lg border">
        <ApplicationGraph
          name={name.trim() || "Untitled application"}
          resources={resourcesWithIds(resourceIds)}
        />
        {resourceIds.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm text-muted-foreground">
            Resources you add appear here.
          </p>
        )}
      </div>
    </section>
  );
}
