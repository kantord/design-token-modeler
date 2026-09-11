export interface PaletteColor {
  name: string;
  hex: string;
}

export type AnsiRole = `ansi${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15}`;
export type SemanticRole = "neutral" | "accent" | AnsiRole;

export type Mapping = Record<SemanticRole, string>;

export interface RoleDescriptor {
  role: SemanticRole;
  label: string;
  description?: string;
}

export const TOKEN_ROLES: RoleDescriptor[] = [
  { role: "neutral", label: "Neutral", description: "Backgrounds, borders, and body text" },
  { role: "accent", label: "Accent", description: "Primary actions and focus rings" },
];

interface AnsiRoleDescriptor extends RoleDescriptor {
  role: AnsiRole;
  /** Name of the closest-hued color in DEFAULT_PALETTE, used to seed DEFAULT_MAPPING. */
  defaultColorName: string;
}

// The 8 canonical ANSI hues (0-7); each also has a "light"/bright counterpart
// at ANSI 8-15 (e.g. ANSI 2 "Green" / ANSI 10 "Light Green").
const ANSI_BASE = [
  { name: "Black", defaultColorName: "neutral" },
  { name: "Red", defaultColorName: "red" },
  { name: "Green", defaultColorName: "green" },
  { name: "Yellow", defaultColorName: "yellow" },
  { name: "Blue", defaultColorName: "blue" },
  { name: "Magenta", defaultColorName: "red" },
  { name: "Cyan", defaultColorName: "blue" },
  { name: "White", defaultColorName: "neutral" },
] as const;

export const ANSI_ROLES: AnsiRoleDescriptor[] = ANSI_BASE.flatMap(({ name, defaultColorName }, i) => [
  { role: `ansi${i}` as AnsiRole, label: `Terminal ${name} (ANSI ${i})`, defaultColorName },
  {
    role: `ansi${i + 8}` as AnsiRole,
    label: `Terminal Light ${name} (ANSI ${i + 8})`,
    defaultColorName,
  },
]);

export const SEMANTIC_ROLES: RoleDescriptor[] = [...TOKEN_ROLES, ...ANSI_ROLES];

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
  ...(Object.fromEntries(ANSI_ROLES.map((r) => [r.role, r.defaultColorName])) as Record<
    AnsiRole,
    string
  >),
};

/** Looks up the hex for a mapped role, falling back to the first palette entry. */
export function hexForRole(palette: PaletteColor[], mapping: Mapping, role: SemanticRole): string {
  return palette.find((c) => c.name === mapping[role])?.hex ?? palette[0]?.hex ?? "#000000";
}
