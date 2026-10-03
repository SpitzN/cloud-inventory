import { describe, expect, it } from "vitest";
import { NODE_SIZE, ringLayout } from "@/features/applications/lib/ring-layout";

const CENTRE = { x: 0, y: 0 };

function overlaps(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.abs(a.x - b.x) < NODE_SIZE.width && Math.abs(a.y - b.y) < NODE_SIZE.height;
}

function angleFromTop({ x, y }: { x: number; y: number }) {
  // Screen coordinates: y grows downwards, so clockwise from the top is towards positive x.
  return (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI);
}

describe("ringLayout", () => {
  it("places nothing for no nodes", () => {
    expect(ringLayout(0)).toEqual([]);
  });

  it("gives one position per node", () => {
    expect(ringLayout(7)).toHaveLength(7);
  });

  it("puts the first node straight above the centre", () => {
    const [first] = ringLayout(5);

    expect(first?.x).toBeCloseTo(0);
    expect(first?.y).toBeLessThan(0);
  });

  it("puts the second node clockwise from the first", () => {
    const [, second] = ringLayout(4);

    expect(second?.x).toBeGreaterThan(0);
  });

  it("spaces the nodes at equal angles, clockwise", () => {
    const positions = ringLayout(6);

    positions.forEach((position, index) => {
      expect(angleFromTop(position)).toBeCloseTo((index * 2 * Math.PI) / 6);
    });
  });

  it("keeps every node at the same distance from the centre", () => {
    const distances = ringLayout(9).map(({ x, y }) => Math.hypot(x, y));

    distances.forEach((distance) => {
      expect(distance).toBeCloseTo(distances[0] ?? Number.NaN);
    });
  });

  it("never overlaps two nodes, or a node and the centre, from 1 to 12 nodes", () => {
    for (let count = 1; count <= 12; count += 1) {
      const positions = [CENTRE, ...ringLayout(count)];
      const overlapping = positions.flatMap((a, i) =>
        positions.slice(i + 1).filter((b) => overlaps(a, b)),
      );

      expect(overlapping, `${count} nodes`).toEqual([]);
    }
  });

  it("grows the ring as nodes are added", () => {
    const radius = (count: number) =>
      Math.hypot(ringLayout(count)[0]?.x ?? 0, ringLayout(count)[0]?.y ?? 0);

    expect(radius(12)).toBeGreaterThan(radius(3));
  });

  it("gives the same result every time", () => {
    expect(ringLayout(8)).toEqual(ringLayout(8));
  });
});
