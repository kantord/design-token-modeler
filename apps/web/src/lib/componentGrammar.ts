/**
 * Schema for the "component system" that describes a themeable UI as a finite
 * tree: container "surfaces" (e.g. card, button) that may contain other
 * surfaces and terminal "leaves" (e.g. text, border), plus interactive
 * surfaces that must declare which pseudo-states (hover, pressed, focus) they
 * handle. Every walk from the root to a reachable node is a possible design
 * token address (see `enumerateAddresses`).
 *
 * This models the grammar itself, purely structurally — no color math. It's
 * deliberately independent from `palette.ts`/`theme.ts` (the WASM-backed
 * color system): the two aren't wired together yet.
 */
import * as z from "zod";

export const STATE_KINDS = ["hover", "pressed", "focus"] as const;
export type StateKind = (typeof STATE_KINDS)[number];

const NodeId = z
  .string()
  .min(1, "Id is required")
  .regex(/^[a-z][a-z0-9-]*$/, "Lowercase letters, digits, and hyphens only, starting with a letter");

const BaseSurfaceFields = {
  id: NodeId,
  label: z.string().min(1, "Label is required"),
  anchor: z.string(),
  constraint: z.string(),
  contains: z.array(z.string()),
  leaves: z.array(z.string()),
};

export const StaticSurfaceSchema = z.object({
  ...BaseSurfaceFields,
  kind: z.literal("static"),
});

export const InteractiveSurfaceSchema = z.object({
  ...BaseSurfaceFields,
  kind: z.literal("interactive"),
  states: z.array(z.enum(STATE_KINDS)).min(1, "Interactive surfaces need at least one state"),
});

export const SurfaceSchema = z.discriminatedUnion("kind", [StaticSurfaceSchema, InteractiveSurfaceSchema]);
export type Surface = z.infer<typeof SurfaceSchema>;

export const LeafSchema = z.object({
  id: NodeId,
  label: z.string().min(1, "Label is required"),
  anchor: z.string(),
  constraint: z.string(),
});
export type Leaf = z.infer<typeof LeafSchema>;

export const GrammarSchema = z
  .object({
    root: z.string().min(1, "Pick a root surface"),
    maxDepth: z.number().int().min(1).max(20),
    surfaces: z.array(SurfaceSchema),
    leaves: z.array(LeafSchema),
  })
  .superRefine((grammar, ctx) => {
    const surfaceIds = new Set<string>();
    grammar.surfaces.forEach((surface, i) => {
      if (surfaceIds.has(surface.id)) {
        ctx.addIssue({ code: "custom", message: `Duplicate surface id "${surface.id}"`, path: ["surfaces", i, "id"] });
      }
      surfaceIds.add(surface.id);
    });

    const leafIds = new Set<string>();
    grammar.leaves.forEach((leaf, i) => {
      if (leafIds.has(leaf.id)) {
        ctx.addIssue({ code: "custom", message: `Duplicate leaf id "${leaf.id}"`, path: ["leaves", i, "id"] });
      }
      leafIds.add(leaf.id);
    });

    if (grammar.root && !surfaceIds.has(grammar.root)) {
      ctx.addIssue({ code: "custom", message: `"${grammar.root}" is not a defined surface`, path: ["root"] });
    }

    grammar.surfaces.forEach((surface, i) => {
      surface.contains.forEach((ref, j) => {
        if (!surfaceIds.has(ref)) {
          ctx.addIssue({ code: "custom", message: `"${ref}" is not a defined surface`, path: ["surfaces", i, "contains", j] });
        }
      });
      surface.leaves.forEach((ref, j) => {
        if (!leafIds.has(ref)) {
          ctx.addIssue({ code: "custom", message: `"${ref}" is not a defined leaf`, path: ["surfaces", i, "leaves", j] });
        }
      });
    });
  });
export type Grammar = z.infer<typeof GrammarSchema>;

/** A small illustrative starting grammar: a button restricted to text/icon
 * leaves, reused both directly on the background and nested in a card, with
 * a required hover state. */
export function defaultGrammar(): Grammar {
  return {
    root: "background",
    maxDepth: 6,
    surfaces: [
      {
        id: "background",
        label: "Background",
        kind: "static",
        anchor: "root",
        constraint: "",
        contains: ["card", "button"],
        leaves: ["text"],
      },
      {
        id: "card",
        label: "Card",
        kind: "static",
        anchor: "elevate(1)",
        constraint: "apca >= ui_min vs parent",
        contains: ["button"],
        leaves: ["text", "border"],
      },
      {
        id: "button",
        label: "Button",
        kind: "interactive",
        anchor: "intent(accent)",
        constraint: "apca >= label_min vs surface",
        contains: [],
        leaves: ["text", "icon"],
        states: ["hover"],
      },
    ],
    leaves: [
      { id: "text", label: "Text", anchor: "on-color", constraint: "apca >= text_min vs surface" },
      { id: "border", label: "Border", anchor: "toward-fg(1)", constraint: "apca >= ui_min vs surface" },
      { id: "icon", label: "Icon", anchor: "on-color", constraint: "apca >= label_min vs surface" },
    ],
  };
}

/** Every reachable path from the root, e.g. "background/card/button/text" —
 * one entry per surface node plus one per leaf attached to it. Bounded by
 * `maxDepth` so a cycle (a surface containing itself, directly or through
 * others) can't loop forever. */
export function enumerateAddresses(grammar: Grammar): string[] {
  const surfaceById = new Map(grammar.surfaces.map((s) => [s.id, s]));
  const leafById = new Map(grammar.leaves.map((l) => [l.id, l]));
  const addresses: string[] = [];

  function walk(surfaceId: string, path: string[], depth: number) {
    if (depth > grammar.maxDepth) return;
    const surface = surfaceById.get(surfaceId);
    if (!surface) return;
    const here = [...path, surfaceId];
    addresses.push(here.join("/"));
    for (const leafId of surface.leaves) {
      if (leafById.has(leafId)) addresses.push([...here, leafId].join("/"));
    }
    for (const childId of surface.contains) {
      walk(childId, here, depth + 1);
    }
  }

  if (surfaceById.has(grammar.root)) walk(grammar.root, [], 1);
  return addresses;
}

/** Validation messages whose issue path exactly matches `path`, e.g.
 * `issuesAt(issues, ["surfaces", 0, "id"])` for the first surface's id field. */
export function issuesAt(issues: { path: PropertyKey[]; message: string }[], path: (string | number)[]): string[] {
  return issues
    .filter((issue) => issue.path.length === path.length && issue.path.every((p, i) => p === path[i]))
    .map((issue) => issue.message);
}
