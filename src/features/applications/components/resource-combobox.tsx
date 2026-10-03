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
import { resourceById, resources } from "@/domain/dataset";
import type { Resource } from "@/domain/resource";
import { compareResourcesInDefaultOrder } from "@/domain/resource-order";

const OPTIONS = resources.toSorted(compareResourcesInDefaultOrder);

/**
 * A controlled chip combobox over Resource ids. `value` is shown as chips in the order given;
 * picking an option calls `onValueChange` with its id added at the end, and removing a chip calls
 * it with that id left out. The input props go to the text input, which also takes the ref.
 */
export function ResourceCombobox({
  value,
  onValueChange,
  ...inputProps
}: {
  value: readonly string[];
  onValueChange: (value: string[]) => void;
} & Pick<ComponentProps<"input">, "id" | "ref" | "aria-invalid" | "aria-describedby">) {
  const anchor = useComboboxAnchor();
  const members = value.flatMap((id) => resourceById(id) ?? []);

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
              <span className="truncate">{resource.name}</span>
              <span className="ml-auto text-muted-foreground">{resource.type}</span>
              <Badge variant={criticalityTone(resource.criticality)}>{resource.criticality}</Badge>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
