import { CardDescription, CardTitle } from "@/components/ui/card";
import { RhfFields } from "@/lib/insane-forms";
import { PaletteFormSchema } from "./palette-form";

function PaletteEditor() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>Colors</CardTitle>
        <CardDescription>Add named colors, then map them to a role below.</CardDescription>
      </div>
      <RhfFields schema={PaletteFormSchema} />
    </div>
  );
}

export { PaletteEditor };
