import { CriticalitySchema, type Criticality } from "@/domain/resource";
import type { Tone } from "@/lib/tone";

/** The level's position from low (0) to critical (3), read from the schema's own order. */
export function criticalityRank(criticality: Criticality) {
  return CriticalitySchema.options.indexOf(criticality);
}

/** A sort comparator that puts the most critical level first. */
export function compareCriticality(a: Criticality, b: Criticality) {
  return criticalityRank(b) - criticalityRank(a);
}

const CRITICALITY_TONE = {
  low: "neutral",
  medium: "caution",
  high: "warning",
  critical: "danger",
} as const satisfies Record<Criticality, Tone>;

export function criticalityTone(criticality: Criticality) {
  return CRITICALITY_TONE[criticality];
}
