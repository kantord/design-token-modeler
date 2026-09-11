import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwatchPicker } from "@/components/ui/color-swatch-picker";
import { Label } from "@/components/ui/label";
import { SEMANTIC_ROLES, type Mapping, type PaletteColor, type SemanticRole } from "@/lib/palette";

export interface MappingEditorProps {
  palette: PaletteColor[];
  mapping: Mapping;
  onChange: (role: SemanticRole, colorName: string) => void;
}

function MappingEditor({ palette, mapping, onChange }: MappingEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic mapping</CardTitle>
        <CardDescription>Choose which color plays each role in the theme.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {SEMANTIC_ROLES.map(({ role, label, description }) => (
          <div key={role} className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
            <SwatchPicker
              aria-label={`${label} color`}
              options={palette}
              value={mapping[role]}
              onChange={(name) => onChange(role, name)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { MappingEditor };
