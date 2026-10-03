import "@xyflow/react/dist/style.css";
import { Controls, ReactFlow, useReactFlow, type Edge, type NodeTypes } from "@xyflow/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import type { Resource } from "@/domain/resource";
import {
  ApplicationNode,
  type ApplicationGraphNode,
} from "@/features/applications/components/graph/application-node";
import {
  ResourceNode,
  type ResourceGraphNode,
} from "@/features/applications/components/graph/resource-node";
import { NODE_SIZE, ringLayout } from "@/features/applications/lib/ring-layout";

const NODE_TYPES = {
  application: ApplicationNode,
  resource: ResourceNode,
} satisfies NodeTypes;

const CENTRE_ID = "application";

// Positions are node centres, as the ring layout gives them.
const NODE_ORIGIN: [number, number] = [0.5, 0.5];

// React Flow's default of 0.5 stops fit-to-view short of twelve Members in the drawer's graph.
const MIN_ZOOM = 0.25;

/**
 * An Application as a hub-and-spoke graph: its name at the centre and one node per Resource on a
 * ring, in the order given, starting at the top. Fills its parent, which needs a height. Read-only:
 * the view pans, zooms and fits, and fits again when the set of Resources changes.
 */
export function ApplicationGraph({
  name,
  resources,
}: {
  name: string;
  resources: readonly Resource[];
}) {
  const { resolvedTheme } = useTheme();
  const positions = ringLayout(resources.length);

  const nodes: (ApplicationGraphNode | ResourceGraphNode)[] = [
    {
      id: CENTRE_ID,
      type: "application",
      position: { x: 0, y: 0 },
      data: { name },
      ...NODE_SIZE,
    },
    ...resources.map((resource, index) => ({
      id: resource.id,
      type: "resource" as const,
      position: positions[index] ?? { x: 0, y: 0 },
      data: { resource },
      ...NODE_SIZE,
    })),
  ];

  const edges: Edge[] = resources.map((resource) => ({
    id: `${CENTRE_ID}-${resource.id}`,
    source: CENTRE_ID,
    target: resource.id,
    type: "straight",
  }));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      nodeOrigin={NODE_ORIGIN}
      colorMode={resolvedTheme === "dark" ? "dark" : "light"}
      nodesDraggable={false}
      nodesConnectable={false}
      deleteKeyCode={null}
      elementsSelectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      minZoom={MIN_ZOOM}
      fitView
    >
      <Controls showInteractive={false} />
      <FitViewOnChange nodeIds={resources.map((resource) => resource.id).join(",")} />
    </ReactFlow>
  );
}

/** Fits the view again whenever `nodeIds` changes; React Flow's `fitView` prop fits only once. */
function FitViewOnChange({ nodeIds }: { nodeIds: string }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Queued by React Flow until the new nodes are measured.
    void fitView();
  }, [fitView, nodeIds]);

  return null;
}
