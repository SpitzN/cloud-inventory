import type { ReactElement, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** An icon-only control whose `label` is both its accessible name and its tooltip. */
export function IconControl({
  label,
  render,
  children,
}: {
  label: string;
  render: ReactElement;
  children?: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger aria-label={label} render={render}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
