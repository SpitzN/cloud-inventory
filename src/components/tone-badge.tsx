import { cn } from "cn";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/lib/tone";

/** A badge coloured by its tone. The children carry the meaning, so colour is never the only cue. */
export function ToneBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    // Not cva: lint cannot read a variant function's result on a primitive, only literal classes.
    <Badge
      className={cn(
        tone === "neutral" && "bg-tone-neutral/10 text-tone-neutral",
        tone === "caution" && "bg-tone-caution/10 text-tone-caution",
        tone === "warning" && "bg-tone-warning/10 text-tone-warning",
        tone === "danger" && "bg-tone-danger/10 text-tone-danger",
      )}
    >
      {children}
    </Badge>
  );
}
