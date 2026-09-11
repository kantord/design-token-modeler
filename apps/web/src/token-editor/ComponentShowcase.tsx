import type { ReactNode } from "react";
import { tokenNameFromClass } from "hello-wasm";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { OsWindow } from "@/components/ui/os-window";
import { Switch } from "@/components/ui/switch";

interface ComponentExample {
  name: string;
  render: () => ReactNode;
  /** Every Tailwind utility class this example actually renders with that draws
   * from a shadcn color token (bg-/text-/border-), read straight from its source. */
  colorClasses: string[];
}

const EXAMPLES: ComponentExample[] = [
  {
    name: "Button",
    render: () => (
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
    ),
    colorClasses: [
      "bg-primary",
      "text-primary-foreground",
      "bg-secondary",
      "text-secondary-foreground",
      "border-border",
      "bg-background",
      "bg-destructive/10",
      "text-destructive",
      "text-primary",
    ],
  },
  {
    name: "Badge",
    render: () => (
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    ),
    colorClasses: [
      "bg-primary",
      "text-primary-foreground",
      "bg-secondary",
      "text-secondary-foreground",
      "bg-destructive/10",
      "text-destructive",
      "border-border",
      "text-foreground",
    ],
  },
  {
    name: "Switch",
    render: () => (
      <div className="flex items-center gap-6">
        <Switch aria-label="Off" />
        <Switch aria-label="On" defaultSelected />
      </div>
    ),
    colorClasses: ["bg-input", "bg-primary", "bg-background"],
  },
];

function ComponentShowcase() {
  const [index, setIndex] = useState(0);
  const example = EXAMPLES[index];

  function showPrevious() {
    setIndex((i) => (i - 1 + EXAMPLES.length) % EXAMPLES.length);
  }

  function showNext() {
    setIndex((i) => (i + 1) % EXAMPLES.length);
  }

  return (
    <OsWindow title="Component gallery" className="w-full">
      <div className="flex flex-col gap-4 bg-card p-4 text-card-foreground" data-testid="component-showcase">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{example.name}</CardTitle>
            <CardDescription>Color classes used by this component</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Previous component" onPress={showPrevious}>
              ‹
            </Button>
            <span className="text-xs text-muted-foreground">
              {index + 1} / {EXAMPLES.length}
            </span>
            <Button variant="ghost" size="icon" aria-label="Next component" onPress={showNext}>
              ›
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">{example.render()}</div>

        <div className="flex flex-col gap-1.5">
          {example.colorClasses.map((className) => (
            <div key={className} className="flex items-center gap-2">
              <span
                className="size-4 shrink-0 rounded-full ring-1 ring-foreground/10"
                style={{ backgroundColor: `var(--${tokenNameFromClass(className)})` }}
              />
              <code className="text-xs">{className}</code>
            </div>
          ))}
        </div>
      </div>
    </OsWindow>
  );
}

export { ComponentShowcase };
