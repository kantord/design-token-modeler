export interface PaletteColor {
  name: string;
  hex: string;
}

export type SemanticRole = "neutral" | "accent";

export type Mapping = Record<SemanticRole, string>;

export const SEMANTIC_ROLES: { role: SemanticRole; label: string; description: string }[] = [
  { role: "neutral", label: "Neutral", description: "Backgrounds, borders, and body text" },
  { role: "accent", label: "Accent", description: "Primary actions and focus rings" },
];

export const DEFAULT_PALETTE: PaletteColor[] = [
  { name: "neutral", hex: "#71717a" },
  { name: "red", hex: "#ef4444" },
  { name: "orange", hex: "#f97316" },
  { name: "blue", hex: "#3b82f6" },
  { name: "green", hex: "#22c55e" },
  { name: "yellow", hex: "#eab308" },
];

export const DEFAULT_MAPPING: Mapping = {
  neutral: "neutral",
  accent: "blue",
};

/** Looks up the hex for a mapped role, falling back to the first palette entry. */
export function hexForRole(palette: PaletteColor[], mapping: Mapping, role: SemanticRole): string {
  return palette.find((c) => c.name === mapping[role])?.hex ?? palette[0]?.hex ?? "#000000";
}
