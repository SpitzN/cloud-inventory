import { CriticalitySchema, type Criticality } from "@/domain/resource";
import type { Tone } from "@/lib/tone";

export function criticalityRank(criticality: Criticality) {
  return CriticalitySchema.options.indexOf(criticality);
}

export function compareCriticality(a: Criticality, b: Criticality) {
  return criticalityRank(b) - criticalityRank(a);
}

export function mostCritical(levels: Iterable<Criticality>) {
  let most: Criticality | undefined;
  for (const level of levels) {
    if (most === undefined || criticalityRank(level) > criticalityRank(most)) {
      most = level;
    }
  }
  return most;
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
