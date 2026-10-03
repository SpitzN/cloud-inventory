import type { ReactElement, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
