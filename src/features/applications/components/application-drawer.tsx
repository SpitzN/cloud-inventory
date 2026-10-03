import { useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router";
import { XIcon } from "lucide-react";
import { IconControl } from "@/components/icon-control";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "@/components/ui/toast";
import type { Application } from "@/domain/application";
import { resourcesInDefaultOrder } from "@/domain/resource-order";
import { DeleteApplication } from "@/features/applications/components/delete-application";
import { ApplicationGraph } from "@/features/applications/components/graph/application-graph";
import { MemberTable } from "@/features/applications/components/member-table";
import { useApplicationsStore } from "@/features/applications/stores/applications";
import { useGoBack } from "@/hooks/use-go-back";

export function ApplicationDrawer() {
  const id = useMatch("/applications/:id")?.params.id;
  const navigate = useNavigate();
  const goBack = useGoBack("/applications");
  const application = useApplicationsStore((state) =>
    state.applications.find((saved) => saved.id === id),
  );
  const remove = useApplicationsStore((state) => state.remove);
  // Kept while the drawer slides out, also after a delete, and forgotten once it has shut.
  const [shown, setShown] = useState<Application>();
  const isMissing = id !== undefined && application === undefined && id !== shown?.id;
  // Base UI does not animate a drawer that mounts open, so it is held closed for one frame.
  const [hasPainted, setHasPainted] = useState(false);

  if (application !== undefined && application !== shown) {
    setShown(application);
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHasPainted(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isMissing) {
      return;
    }
    // Added after navigating: on a first load the toaster subscribes only then. The fixed id stops
    // Strict Mode's second run from adding a second toast.
    const reportNotFound = async () => {
      await navigate("/applications", { replace: true });
      toast.add({ id: "application-not-found", title: "Application not found" });
    };
    void reportNotFound();
  }, [isMissing, navigate]);

  // The drawer itself stays mounted, so that every open is a change from closed and slides in.
  return (
    <Drawer
      open={hasPainted && application !== undefined}
      swipeDirection="right"
      onOpenChange={(open) => {
        if (open) {
          return;
        }
        void goBack();
      }}
      onOpenChangeComplete={(open) => {
        if (open) {
          return;
        }
        setShown(undefined);
      }}
    >
      {shown !== undefined && (
        <DrawerPanel
          application={shown}
          onDelete={async () => {
            remove(shown.id);
            toast.add({
              title: "Application deleted",
              description: <span className="wrap-break-word">{shown.name}</span>,
            });
            await goBack();
          }}
        />
      )}
    </Drawer>
  );
}

function DrawerPanel({
  application,
  onDelete,
}: {
  application: Application;
  onDelete: () => Promise<void>;
}) {
  const { id, name, description } = application;

  return (
    <DrawerContent variant="floating" className="w-11/20 min-w-140">
      <DrawerHeader className="mb-4">
        <div className="flex items-center gap-2">
          <DrawerTitle size="large" className="min-w-0 flex-1">
            <span className="block truncate" title={name}>
              {name}
            </span>
          </DrawerTitle>
          <IconControl
            label="Close"
            render={<DrawerClose render={<Button variant="ghost" size="icon-sm" />} />}
          >
            <XIcon />
          </IconControl>
        </div>
        {description !== undefined && (
          <DrawerDescription>
            <span className="line-clamp-2 wrap-break-word" title={description}>
              {description}
            </span>
          </DrawerDescription>
        )}
      </DrawerHeader>
      <DrawerBody key={id} application={application} onDelete={onDelete} />
    </DrawerContent>
  );
}

function DrawerBody({
  application: { name, resourceIds },
  onDelete,
}: {
  application: Application;
  onDelete: () => Promise<void>;
}) {
  const [hoveredResourceId, setHoveredResourceId] = useState<string>();
  const [focusedResourceId, setFocusedResourceId] = useState<string>();
  const highlightedResourceId = hoveredResourceId ?? focusedResourceId;
  const members = resourcesInDefaultOrder(resourceIds);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
      {/* Dragging the graph pans it; without this, a drag to the right would swipe the drawer shut. */}
      <div data-base-ui-swipe-ignore className="h-96 shrink-0 overflow-hidden rounded-lg border">
        <ApplicationGraph
          name={name}
          resources={members}
          highlightedResourceId={highlightedResourceId}
          onResourceHover={setHoveredResourceId}
        />
      </div>
      <section className="flex flex-col gap-2" aria-labelledby="member-resources">
        <h3 id="member-resources" className="text-sm font-semibold">
          Member resources{" "}
          <span className="font-normal text-muted-foreground tabular-nums">· {members.length}</span>
        </h3>
        <MemberTable
          resources={members}
          highlightedResourceId={highlightedResourceId}
          onResourceHover={setHoveredResourceId}
          onResourceFocus={setFocusedResourceId}
        />
      </section>
      <DeleteApplication name={name} onDelete={onDelete} />
    </div>
  );
}
