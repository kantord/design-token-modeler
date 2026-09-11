import { useMemo, useState } from "react";
import type { Grammar, Leaf, Surface } from "@/lib/componentGrammar";
import { GrammarSchema, defaultGrammar, issuesAt } from "@/lib/componentGrammar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GrammarPreview } from "./GrammarPreview";
import { LeafRow } from "./LeafRow";
import { SurfaceRow } from "./SurfaceRow";

function newSurface(): Surface {
  return {
    id: `surface-${crypto.randomUUID().slice(0, 8)}`,
    label: "New surface",
    kind: "static",
    anchor: "",
    constraint: "",
    contains: [],
    leaves: [],
  };
}

function newLeaf(): Leaf {
  return {
    id: `leaf-${crypto.randomUUID().slice(0, 8)}`,
    label: "New leaf",
    anchor: "",
    constraint: "",
  };
}

function App() {
  const [grammar, setGrammar] = useState<Grammar>(defaultGrammar);

  const result = useMemo(() => GrammarSchema.safeParse(grammar), [grammar]);
  const issues = result.success ? [] : result.error.issues;

  function updateSurface(index: number, next: Surface) {
    setGrammar((g) => ({ ...g, surfaces: g.surfaces.map((s, i) => (i === index ? next : s)) }));
  }

  function removeSurface(index: number) {
    setGrammar((g) => ({ ...g, surfaces: g.surfaces.filter((_, i) => i !== index) }));
  }

  function updateLeaf(index: number, next: Leaf) {
    setGrammar((g) => ({ ...g, leaves: g.leaves.map((l, i) => (i === index ? next : l)) }));
  }

  function removeLeaf(index: number) {
    setGrammar((g) => ({ ...g, leaves: g.leaves.filter((_, i) => i !== index) }));
  }

  const surfaceOptions = grammar.surfaces.map((s) => ({ id: s.id, label: s.label || s.id }));
  const leafOptions = grammar.leaves.map((l) => ({ id: l.id, label: l.label || l.id }));
  const rootErrors = issuesAt(issues, ["root"]);

  return (
    <main className="mx-auto flex max-w-[80rem] flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Component system editor</h1>
        <p className="text-sm text-muted-foreground">
          Define the grammar of surfaces (containers) and leaves (terminal nodes) that make up your design. Not wired
          up to the color system yet — this just edits the tree shape.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Root surface</CardTitle>
              <CardDescription>The surface every address is a walk from.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <select
                aria-label="Root surface"
                value={grammar.root}
                onChange={(e) => setGrammar((g) => ({ ...g, root: e.target.value }))}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
              >
                <option value="">Choose a surface</option>
                {surfaceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              {rootErrors.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                  {msg}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Surfaces</CardTitle>
              <CardDescription>Containers. Each one says what it can contain and which leaves attach to it.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {grammar.surfaces.map((surface, index) => (
                <SurfaceRow
                  key={index}
                  surface={surface}
                  surfaceOptions={surfaceOptions}
                  leafOptions={leafOptions}
                  errors={{
                    id: issuesAt(issues, ["surfaces", index, "id"]),
                    contains: surface.contains.map((_, j) => issuesAt(issues, ["surfaces", index, "contains", j])),
                    leaves: surface.leaves.map((_, j) => issuesAt(issues, ["surfaces", index, "leaves", j])),
                    states: issuesAt(issues, ["surfaces", index, "states"]),
                  }}
                  onChange={(next) => updateSurface(index, next)}
                  onRemove={() => removeSurface(index)}
                />
              ))}
              <Button variant="outline" onPress={() => setGrammar((g) => ({ ...g, surfaces: [...g.surfaces, newSurface()] }))} className="self-start">
                Add surface
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaves</CardTitle>
              <CardDescription>Terminal nodes, e.g. text, border, icon. Reused by any surface that lists them.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {grammar.leaves.map((leaf, index) => (
                <LeafRow
                  key={index}
                  leaf={leaf}
                  errors={{ id: issuesAt(issues, ["leaves", index, "id"]) }}
                  onChange={(next) => updateLeaf(index, next)}
                  onRemove={() => removeLeaf(index)}
                />
              ))}
              <Button variant="outline" onPress={() => setGrammar((g) => ({ ...g, leaves: [...g.leaves, newLeaf()] }))} className="self-start">
                Add leaf
              </Button>
            </CardContent>
          </Card>
        </div>

        <div data-testid="grammar-preview">
          <GrammarPreview grammar={grammar} />
        </div>
      </div>
    </main>
  );
}

export default App;
