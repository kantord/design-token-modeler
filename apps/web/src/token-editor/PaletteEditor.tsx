import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPickerField } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import type { PaletteColor } from "@/lib/palette";

export interface PaletteEditorProps {
  palette: PaletteColor[];
  onRename: (index: number, name: string) => void;
  onRecolor: (index: number, hex: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

function PaletteEditor({ palette, onRename, onRecolor, onRemove, onAdd }: PaletteEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colors</CardTitle>
        <CardDescription>Add named colors, then map them to a role below.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {palette.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              aria-label="Color name"
              value={color.name}
              onChange={(event) => onRename(index, event.target.value)}
              className="w-24 shrink-0"
            />
            <ColorPickerField
              value={color.hex}
              onChange={(hex) => onRecolor(index, hex)}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${color.name}`}
              onPress={() => onRemove(index)}
              isDisabled={palette.length <= 1}
            >
              ×
            </Button>
          </div>
        ))}
        <Button variant="outline" onPress={onAdd} className="mt-1 self-start">
          Add color
        </Button>
      </CardContent>
    </Card>
  );
}

export { PaletteEditor };
