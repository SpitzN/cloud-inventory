import { Handle, Position, type HandleType } from "@xyflow/react";

// React Flow's stylesheet pins a handle to an edge of its node, and being unlayered it wins over
// Tailwind's utilities; only an inline style moves it. A left handle moved to `left: 50%` sits at
// the node's centre, so each edge runs centre to centre and the opaque nodes cover its ends.
const AT_THE_CENTRE = { left: "50%" };

/** An invisible, unconnectable handle at the node's centre, where its straight edges meet. */
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
