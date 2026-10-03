import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ValueFilterOption {
  value: string;
  count: number;
}

export function ValueFilter({
  title,
  options,
  ticked,
  onTickedChange,
}: {
  title: string;
  options: readonly ValueFilterOption[];
  ticked: readonly string[];
  onTickedChange: (ticked: string[]) => void;
}) {
  function toggle(value: string, checked: boolean) {
    onTickedChange(
      options
        .map((option) => option.value)
        .filter((option) => (option === value ? checked : ticked.includes(option))),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        {title}
        {ticked.map((value) => (
          <Badge key={value} variant="secondary">
            {value}
          </Badge>
        ))}
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map(({ value, count }) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={ticked.includes(value)}
            onCheckedChange={(checked) => {
              toggle(value, checked);
            }}
          >
            {value}
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">{count}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
