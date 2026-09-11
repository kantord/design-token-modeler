import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RhfFields } from "@/lib/insane-forms";
import { PaletteFormSchema } from "./palette-form";

function PaletteEditor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colors</CardTitle>
        <CardDescription>Add named colors, then map them to a role below.</CardDescription>
      </CardHeader>
      <CardContent>
        <RhfFields schema={PaletteFormSchema} />
      </CardContent>
    </Card>
  );
}

export { PaletteEditor };
