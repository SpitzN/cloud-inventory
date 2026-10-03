import type { Node, NodeProps } from "@xyflow/react";
import { CentreHandle } from "@/features/applications/components/graph/centre-handle";

export type ApplicationGraphNode = Node<{ name: string }, "application">;

export function ApplicationNode({ data: { name } }: NodeProps<ApplicationGraphNode>) {
  return (
    <div className="flex size-full items-center justify-center rounded-lg bg-primary px-3 text-primary-foreground">
      <span className="truncate font-medium" title={name}>
        {name}
      </span>
      <CentreHandle type="source" />
    </div>
  );
}
