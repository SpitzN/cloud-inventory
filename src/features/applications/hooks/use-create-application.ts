import { useNavigate } from "react-router";
import { toast } from "@/components/ui/toast";
import type { Application } from "@/domain/application";
import { useApplicationsStore } from "@/features/applications/stores/applications";

/** Replaces the form's history entry first, so Back from the new drawer shows the list. */
export function useCreateApplication() {
  const create = useApplicationsStore((state) => state.create);
  const navigate = useNavigate();

  return async (application: Omit<Application, "id">) => {
    const { id, name } = create(application);
    await navigate("/applications", { replace: true });
    await navigate(`/applications/${id}`);
    toast.add({ type: "success", title: "Application created", description: name });
  };
}
