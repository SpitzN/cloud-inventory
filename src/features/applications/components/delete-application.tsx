import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteApplicationProps {
  name: string;
  /** Runs once, on "Delete". The dialog stays open, its buttons disabled, until it settles. */
  onDelete: () => Promise<void>;
}

/** "Delete application", which asks for confirmation naming the Application before `onDelete` runs. */
export function DeleteApplication({ name, onDelete }: DeleteApplicationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" className="self-start" />}>
        Delete application
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete <span className="wrap-break-word">{name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The application is removed. Its resources are not affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={() => {
              setIsDeleting(true);
              void onDelete();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
