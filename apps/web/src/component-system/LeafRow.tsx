import type { Leaf } from "@/lib/componentGrammar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface LeafRowProps {
  leaf: Leaf;
  errors: { id: string[] };
  onChange: (next: Leaf) => void;
  onRemove: () => void;
}

function LeafRow({ leaf, errors, onChange, onRemove }: LeafRowProps) {
  return (
    <div data-testid="leaf-row" className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Input
            aria-label="Leaf id"
            value={leaf.id}
            onChange={(e) => onChange({ ...leaf, id: e.target.value })}
            className="font-mono"
          />
          {errors.id.map((msg) => (
            <p key={msg} className="text-xs text-destructive">
              {msg}
            </p>
          ))}
        </div>
        <Input
          aria-label="Leaf label"
          value={leaf.label}
          onChange={(e) => onChange({ ...leaf, label: e.target.value })}
          className="flex-1"
        />
        <Button variant="ghost" size="icon" aria-label={`Remove ${leaf.label}`} onPress={onRemove}>
          ×
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          aria-label="Leaf anchor expression"
          placeholder="anchor, e.g. on-color"
          value={leaf.anchor}
          onChange={(e) => onChange({ ...leaf, anchor: e.target.value })}
        />
        <Input
          aria-label="Leaf constraint expression"
          placeholder="constraint, e.g. apca >= text_min"
          value={leaf.constraint}
          onChange={(e) => onChange({ ...leaf, constraint: e.target.value })}
        />
      </div>
    </div>
  );
}

export { LeafRow };
