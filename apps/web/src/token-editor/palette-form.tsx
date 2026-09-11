import type { CollectionProps, CollectionWrapper, FieldProps } from "insane-forms";
import * as insane from "insane-forms";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ColorPickerField } from "@/components/ui/color-picker";
import { FieldShell } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const NameWidget = (p: FieldProps<string | undefined>) => (
  <Input
    id={p.name}
    value={p.value ?? ""}
    aria-label="Color name"
    onChange={(event) => p.onChange(event.target.value)}
    onBlur={p.onBlur}
    className="w-24 shrink-0"
  />
);

const HexWidget = (p: FieldProps<string | undefined>) => (
  <ColorPickerField value={p.value ?? "#000000"} onChange={p.onChange} className="flex-1" />
);

const NameField = insane.field({
  schema: z.string().min(1, "Name is required"),
  widget: NameWidget,
  shell: FieldShell,
});

const HexField = insane.field({
  schema: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex color"),
  widget: HexWidget,
  shell: FieldShell,
});

const ColorEntry = insane.group({
  name: NameField,
  hex: HexField,
});

/** List chrome: one row per color (name field + hex field + remove), an "Add
 * color" button. `it.remove` is absent once removing would breach the array's
 * `.min(1)` — insane-forms enforces that bound, we just render around it. */
const PaletteListBox: CollectionWrapper = (props: CollectionProps) => (
  <div className="flex flex-col gap-2">
    {props.items.map((item) => (
      <div key={item.key} data-testid="color-row" className="flex items-center gap-2">
        {item.node}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Remove color"
          isDisabled={!item.remove}
          onPress={() => item.remove?.()}
        >
          ×
        </Button>
      </div>
    ))}
    {props.add && (
      <Button variant="outline" onPress={props.add} className="mt-1 self-start">
        Add color
      </Button>
    )}
  </div>
);

const PaletteField = insane
  .list(ColorEntry, {
    wrapper: PaletteListBox,
    seed: () => ({ name: "", hex: "#000000" }),
  })
  .min(1);

export const PaletteFormSchema = insane.group({
  colors: PaletteField.meta({ title: "Colors" }),
});
