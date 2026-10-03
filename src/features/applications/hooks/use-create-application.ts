import { useNavigate } from "react-router";
import { toast } from "@/components/ui/toast";
import type { Application } from "@/domain/application";
import { useApplicationsStore } from "@/features/applications/stores/applications";

/**
 * Creates an Application: saves it at the front of the list, goes to `/applications` in place of
 * the current history entry, and confirms with a toast naming it.
 */
export function useCreateApplication() {
  const create = useApplicationsStore((state) => state.create);
  const navigate = useNavigate();

  return async (application: Omit<Application, "id">) => {
    const { name } = create(application);
    await navigate("/applications", { replace: true });
    toast.add({ title: "Application created", description: name });
  };
}
