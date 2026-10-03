import type { Node, NodeProps } from "@xyflow/react";
import { cva } from "class-variance-authority";
import { criticalityTone } from "@/domain/criticality";
import type { Resource } from "@/domain/resource";
import { CentreHandle } from "@/features/applications/components/graph/centre-handle";

export type ResourceGraphNode = Node<{ resource: Resource; isHighlighted: boolean }, "resource">;

const criticalityDot = cva("size-2 shrink-0 rounded-full", {
  variants: {
    tone: {
      neutral: "bg-tone-neutral",
      caution: "bg-tone-caution",
      warning: "bg-tone-warning",
      danger: "bg-tone-danger",
    },
  },
});

const resourceNodeBox = cva(
  "flex size-full items-center gap-2 rounded-lg border bg-card px-3 text-card-foreground",
  {
    variants: {
      highlighted: {
        true: "border-primary ring-3 ring-ring/50",
        false: "",
      },
    },
  },
);

/**
 * One Member: Criticality dot, name, Type and Provider, and the open issue count. A highlighted
 * node is outlined, for a caller linking it to another view of the same Resource.
 */
export function ResourceNode({ data: { resource, isHighlighted } }: NodeProps<ResourceGraphNode>) {
  const { name, type, provider, criticality, openIssues } = resource;

  return (
    <div className={resourceNodeBox({ highlighted: isHighlighted })}>
      <span
        role="img"
        aria-label={`${criticality} criticality`}
        title={`${criticality} criticality`}
        className={criticalityDot({ tone: criticalityTone(criticality) })}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium" title={name}>
          {name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {type} · {provider}
        </span>
      </span>
      <span className="tabular-nums" title={`${openIssues} open issues`}>
        {openIssues}
        <span className="sr-only"> open issues</span>
      </span>
      <CentreHandle type="target" />
    </div>
  );
}
