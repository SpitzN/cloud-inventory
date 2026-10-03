import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { criticalityTone } from "@/domain/criticality";
import { resources, resourcesWithIds } from "@/domain/dataset";
import type { Resource } from "@/domain/resource";
import { compareResourcesInDefaultOrder } from "@/domain/resource-order";

const OPTIONS = resources.toSorted(compareResourcesInDefaultOrder);

export function ResourceCombobox({
  value,
  onValueChange,
  ...inputProps
}: {
  value: readonly string[];
  onValueChange: (value: string[]) => void;
} & Pick<
  ComponentProps<"input">,
  "id" | "ref" | "aria-invalid" | "aria-describedby" | "aria-required"
>) {
  const anchor = useComboboxAnchor();
  const members = resourcesWithIds(value);

  return (
    <Combobox
      multiple
      items={OPTIONS}
      itemToStringLabel={(resource: Resource) => resource.name}
      value={members}
      onValueChange={(picked) => {
        onValueChange(picked.map(({ id }) => id));
      }}
    >
      <ComboboxChips ref={anchor}>
        {members.map(({ id, name }) => (
          <ComboboxChip key={id}>
            <span className="max-w-48 truncate" title={name}>
              {name}
            </span>
          </ComboboxChip>
        ))}
        <ComboboxChipsInput {...inputProps} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No resources match.</ComboboxEmpty>
        <ComboboxList>
          {(resource: Resource) => (
            <ComboboxItem key={resource.id} value={resource}>
              <span className="truncate" title={resource.name}>
                {resource.name}
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap text-muted-foreground">
                {resource.type}
              </span>
              <span className="flex w-16 shrink-0">
                <Badge variant={criticalityTone(resource.criticality)}>
                  {resource.criticality}
                </Badge>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
