import { Handle, Position, type HandleType } from "@xyflow/react";

// React Flow's unlayered stylesheet pins a handle to an edge and beats Tailwind, so only an inline
// style moves it to the node's centre, where the opaque nodes cover the edges' ends.
const AT_THE_CENTRE = { left: "50%" };

export function CentreHandle({ type }: { type: HandleType }) {
  return (
    <Handle
      type={type}
      position={Position.Left}
      isConnectable={false}
      className="invisible"
      style={AT_THE_CENTRE}
    />
  );
}
