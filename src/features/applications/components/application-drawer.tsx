import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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
import { resourceById } from "@/domain/dataset";
import { compareResourcesInDefaultOrder } from "@/domain/resource-order";
import { DeleteApplication } from "@/features/applications/components/delete-application";
import { ApplicationGraph } from "@/features/applications/components/graph/application-graph";
import { MemberTable } from "@/features/applications/components/member-table";
import { useApplicationsStore } from "@/features/applications/stores/applications";

/**
 * The Application named by the route's `:id`, in a modal drawer over the Applications page.
 * Closing goes to `/applications`, and so does deleting, which then removes the Application and
 * says so in a toast. An id with no Application goes there too, replacing the history entry, and
 * says so in a toast.
 */
export function ApplicationDrawer() {
  const { id } = useParams();
  const navigate = useNavigate();
  // React Router keys the first location of a visit "default", including when Back returns to it.
  const openedDirectly = useLocation().key === "default";
  const application = useApplicationsStore((state) =>
    state.applications.find((candidate) => candidate.id === id),
  );
  const remove = useApplicationsStore((state) => state.remove);
  const isMissing = application === undefined;
  const isDeleting = useRef(false);

  // Opened from a card, the previous entry is the Applications page: going back to it keeps Back
  // from reopening the drawer.
  const leave = async () => {
    if (openedDirectly) {
      await navigate("/applications", { replace: true });
      return;
    }
    await navigate(-1);
  };

  useEffect(() => {
    if (!isMissing || isDeleting.current) {
      return;
    }
    // On a first load this effect runs before the shell's toaster has subscribed, and a toast added
    // then is lost; the toaster is subscribed once the navigation has settled. A fixed id makes
    // Strict Mode's second run update this toast instead of adding another.
    const reportNotFound = async () => {
      await navigate("/applications", { replace: true });
      toast.add({ id: "application-not-found", title: "Application not found" });
    };
    void reportNotFound();
  }, [isMissing, navigate]);

  if (isMissing) {
    return null;
  }

  const { name, description, resourceIds } = application;
  // Members are filtered to known Resources when the Applications are loaded.
  const members = resourceIds
    .flatMap((resourceId) => resourceById(resourceId) ?? [])
    .toSorted(compareResourcesInDefaultOrder);

  return (
    <Drawer
      open
      swipeDirection="right"
      onOpenChange={(open) => {
        if (open) {
          return;
        }
        void leave();
      }}
    >
      <DrawerContent variant="floating" className="w-11/20 min-w-140">
        <DrawerHeader className="mb-4">
          <div className="flex items-center gap-2">
            <DrawerTitle className="min-w-0 flex-1">
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
          {description !== undefined && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {/* Dragging the graph pans it; without this, a drag to the right would swipe the drawer shut. */}
          <div
            data-base-ui-swipe-ignore
            className="h-96 shrink-0 overflow-hidden rounded-lg border"
          >
            <ApplicationGraph name={name} resources={members} />
          </div>
          <section className="flex flex-col gap-2" aria-labelledby="member-resources">
            <h3 id="member-resources" className="font-medium">
              Member resources · <span className="tabular-nums">{members.length}</span>
            </h3>
            <MemberTable resources={members} />
          </section>
          <DeleteApplication
            name={name}
            onDelete={async () => {
              // A navigation settles before React renders its route, so the drawer can still be
              // mounted when the Application is removed; it must not report it as not found.
              isDeleting.current = true;
              await leave();
              remove(application.id);
              toast.add({ title: "Application deleted", description: name });
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
