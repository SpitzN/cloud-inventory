import "@xyflow/react/dist/style.css";
import {
  Panel,
  ReactFlow,
  useReactFlow,
  useStore,
  type Edge,
  type FitViewOptions,
  type NodeTypes,
} from "@xyflow/react";
import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react";
import { useEffect } from "react";
import { IconControl } from "@/components/icon-control";
import { Button } from "@/components/ui/button";
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

const NODE_ORIGIN: [number, number] = [0.5, 0.5];

// React Flow's default of 0.5 stops fit-to-view short of twelve Members in the drawer's graph.
const MIN_ZOOM = 0.25;

// Fitting never enlarges past the nodes' own size, so a few nodes do not fill the canvas.
const FIT_VIEW_OPTIONS: FitViewOptions = { maxZoom: 1 };

type GraphNode = ApplicationGraphNode | ResourceGraphNode;

export function ApplicationGraph({
  name,
  resources,
  highlightedResourceId,
  onResourceHover,
}: {
  name: string;
  resources: readonly Resource[];
  highlightedResourceId?: string | undefined;
  onResourceHover?: (resourceId: string | undefined) => void;
}) {
  const positions = ringLayout(resources.length);

  const nodes: GraphNode[] = [
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
      data: { resource, isHighlighted: resource.id === highlightedResourceId },
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
      nodesDraggable={false}
      nodesConnectable={false}
      deleteKeyCode={null}
      elementsSelectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      minZoom={MIN_ZOOM}
      onNodeMouseEnter={(_event, node: GraphNode) => {
        if (node.type !== "resource") {
          return;
        }
        onResourceHover?.(node.id);
      }}
      onNodeMouseLeave={(_event, node: GraphNode) => {
        if (node.type !== "resource") {
          return;
        }
        onResourceHover?.(undefined);
      }}
    >
      <GraphControls />
      {/* Joined into a string so the effect compares the ids by value, not the array by identity. */}
      <FitViewOnChange nodeIds={resources.map((resource) => resource.id).join(",")} />
    </ReactFlow>
  );
}

/** React Flow's `fitView` prop fits only once; this fits again whenever `nodeIds` changes. */
function FitViewOnChange({ nodeIds }: { nodeIds: string }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    void fitView(FIT_VIEW_OPTIONS);
  }, [fitView, nodeIds]);

  return null;
}

function GraphControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const isMinZoom = useStore((state) => state.transform[2] <= state.minZoom);
  const isMaxZoom = useStore((state) => state.transform[2] >= state.maxZoom);

  return (
    <Panel position="bottom-left" className="flex flex-col gap-1">
      <IconControl
        label="Zoom in"
        render={
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isMaxZoom}
            onClick={() => void zoomIn()}
          />
        }
      >
        <PlusIcon />
      </IconControl>
      <IconControl
        label="Zoom out"
        render={
          <Button
            variant="outline"
            size="icon-sm"
            disabled={isMinZoom}
            onClick={() => void zoomOut()}
          />
        }
      >
        <MinusIcon />
      </IconControl>
      <IconControl
        label="Fit to view"
        render={
          <Button variant="outline" size="icon-sm" onClick={() => void fitView(FIT_VIEW_OPTIONS)} />
        }
      >
        <ScanIcon />
      </IconControl>
    </Panel>
  );
}
