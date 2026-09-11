import type { Surface, StateKind } from "@/lib/componentGrammar";
import { STATE_KINDS } from "@/lib/componentGrammar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SurfaceRowProps {
  surface: Surface;
  surfaceOptions: { id: string; label: string }[];
  leafOptions: { id: string; label: string }[];
  errors: {
    id: string[];
    contains: string[][];
    leaves: string[][];
    states: string[];
  };
  onChange: (next: Surface) => void;
  onRemove: () => void;
}

function SurfaceRow({ surface, surfaceOptions, leafOptions, errors, onChange, onRemove }: SurfaceRowProps) {
  function toggleContains(id: string) {
    const contains = surface.contains.includes(id)
      ? surface.contains.filter((c) => c !== id)
      : [...surface.contains, id];
    onChange({ ...surface, contains });
  }

  function toggleLeaf(id: string) {
    const leaves = surface.leaves.includes(id) ? surface.leaves.filter((l) => l !== id) : [...surface.leaves, id];
    onChange({ ...surface, leaves });
  }

  function toggleState(state: StateKind) {
    if (surface.kind !== "interactive") return;
    const states = surface.states.includes(state)
      ? surface.states.filter((s) => s !== state)
      : [...surface.states, state];
    onChange({ ...surface, states });
  }

  function setKind(kind: "static" | "interactive") {
    if (kind === "static") {
      const { states: _states, ...rest } = surface as Surface & { states?: StateKind[] };
      onChange({ ...rest, kind: "static" });
    } else {
      onChange({ ...surface, kind: "interactive", states: surface.kind === "interactive" ? surface.states : [] });
    }
  }

  return (
    <div data-testid="surface-row" className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Input
            aria-label="Surface id"
            value={surface.id}
            onChange={(e) => onChange({ ...surface, id: e.target.value } as Surface)}
            className="font-mono"
          />
          {errors.id.map((msg) => (
            <p key={msg} className="text-xs text-destructive">
              {msg}
            </p>
          ))}
        </div>
        <Input
          aria-label="Surface label"
          value={surface.label}
          onChange={(e) => onChange({ ...surface, label: e.target.value } as Surface)}
          className="flex-1"
        />
        <select
          aria-label="Surface kind"
          value={surface.kind}
          onChange={(e) => setKind(e.target.value as "static" | "interactive")}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
        >
          <option value="static">Static</option>
          <option value="interactive">Interactive</option>
        </select>
        <Button variant="ghost" size="icon" aria-label={`Remove ${surface.label}`} onPress={onRemove}>
          ×
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          aria-label="Anchor expression"
          placeholder="anchor, e.g. elevate(1)"
          value={surface.anchor}
          onChange={(e) => onChange({ ...surface, anchor: e.target.value } as Surface)}
        />
        <Input
          aria-label="Constraint expression"
          placeholder="constraint, e.g. apca >= text_min"
          value={surface.constraint}
          onChange={(e) => onChange({ ...surface, constraint: e.target.value } as Surface)}
        />
      </div>

      {surface.kind === "interactive" && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            States handled <span className="text-destructive">(at least one required)</span>
          </span>
          <div className="flex flex-wrap gap-3">
            {STATE_KINDS.map((state) => (
              <label key={state} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={surface.states.includes(state)}
                  onChange={() => toggleState(state)}
                />
                {state}
              </label>
            ))}
          </div>
          {errors.states.map((msg) => (
            <p key={msg} className="text-xs text-destructive">
              {msg}
            </p>
          ))}
        </div>
      )}

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-muted-foreground">Can contain (surfaces)</legend>
        <div className="flex flex-wrap gap-3">
          {surfaceOptions
            .filter((option) => option.id !== surface.id)
            .map((option) => (
              <label key={option.id} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={surface.contains.includes(option.id)}
                  onChange={() => toggleContains(option.id)}
                />
                {option.label}
              </label>
            ))}
          {surfaceOptions.length <= 1 && <span className="text-xs text-muted-foreground">No other surfaces yet.</span>}
        </div>
        {errors.contains.flat().map((msg) => (
          <p key={msg} className="text-xs text-destructive">
            {msg}
          </p>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-muted-foreground">Leaves attached here</legend>
        <div className="flex flex-wrap gap-3">
          {leafOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={surface.leaves.includes(option.id)} onChange={() => toggleLeaf(option.id)} />
              {option.label}
            </label>
          ))}
          {leafOptions.length === 0 && <span className="text-xs text-muted-foreground">No leaves defined yet.</span>}
        </div>
        {errors.leaves.flat().map((msg) => (
          <p key={msg} className="text-xs text-destructive">
            {msg}
          </p>
        ))}
      </fieldset>
    </div>
  );
}

export { SurfaceRow };
