export const NODE_SIZE = { width: 192, height: 64 } as const;

const GAP = 32;

// Two boxes whose centres are at least a diagonal apart cannot overlap, whatever their angle.
const MIN_CENTRE_DISTANCE = Math.hypot(NODE_SIZE.width, NODE_SIZE.height) + GAP;

export function ringLayout(count: number) {
  const step = (2 * Math.PI) / count;
  // Neighbours on a ring of radius r are 2r·sin(step / 2) apart; one node has no neighbour.
  const radius =
    count < 2
      ? MIN_CENTRE_DISTANCE
      : Math.max(MIN_CENTRE_DISTANCE, MIN_CENTRE_DISTANCE / (2 * Math.sin(step / 2)));

  return Array.from({ length: count }, (_, index) => ({
    x: radius * Math.sin(index * step),
    y: -radius * Math.cos(index * step),
  }));
}
