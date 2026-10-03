import { resourcesInDefaultOrder } from "@/domain/resource-order";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { useCreateApplication } from "@/features/applications/hooks/use-create-application";
import { useLeaveNewApplication } from "@/features/applications/hooks/use-leave-new-application";
import { useApplicationsStore } from "@/features/applications/stores/applications";
import { useSelectionStore } from "@/features/resources/stores/selection";

export function NewApplicationPage() {
  const selectedIds = useSelectionStore((state) => state.ids);
  const clearSelection = useSelectionStore((state) => state.clear);
  const applications = useApplicationsStore((state) => state.applications);
  const createApplication = useCreateApplication();
  const leave = useLeaveNewApplication();

  return (
    // The right-hand column is the live preview's.
    <div className="grid grid-cols-2 gap-8">
      <ApplicationForm
        startingValues={{
          name: "",
          description: "",
          resourceIds: resourcesInDefaultOrder(selectedIds).map(({ id }) => id),
        }}
        namesInUse={applications.map(({ name }) => name)}
        onSubmit={(application) => {
          void createApplication(application);
          clearSelection();
        }}
        onCancel={leave}
      />
    </div>
  );
}
