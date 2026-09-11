import { CardDescription, CardTitle } from "@/components/ui/card";
import { SwatchPicker } from "@/components/ui/color-swatch-picker";
import { Label } from "@/components/ui/label";
import type { Mapping, PaletteColor, RoleDescriptor, SemanticRole } from "@/lib/palette";

export interface MappingEditorProps {
  title: string;
  description: string;
  roles: RoleDescriptor[];
  palette: PaletteColor[];
  mapping: Mapping;
  onChange: (role: SemanticRole, colorName: string) => void;
}

function MappingEditor({ title, description, roles, palette, mapping, onChange }: MappingEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <div className="flex flex-col gap-3">
        {roles.map(({ role, label, description: roleDescription }) => (
          <div key={role} className="flex flex-col gap-1.5">
            <Label>{label}</Label>
            {roleDescription && <p className="text-xs text-muted-foreground">{roleDescription}</p>}
            <SwatchPicker
              aria-label={`${label} color`}
              options={palette}
              value={mapping[role]}
              onChange={(name) => onChange(role, name)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export { MappingEditor };
