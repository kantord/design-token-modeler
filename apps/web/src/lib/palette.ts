// Pure type definitions only — the actual seed data and domain logic (default
// palette/roles/mapping, hex resolution, the "neutral can't be removed" rule,
// referential-integrity reconciliation) all live in Rust (see
// crates/hello-lib/src/palette.rs) and are called via "hello-wasm". This file
// exists so the editor/previewer TypeScript has names to type against.

export interface PaletteColor {
  name: string;
  hex: string;
}

/** A mapping key: either a fixed ANSI slot ("ansi0".."ansi15") or a token role's stable `id`. */
export type SemanticRole = string;

export type Mapping = Record<SemanticRole, string>;

/** A fixed (non-editable) role descriptor — currently only the 16 ANSI slots. */
export interface RoleDescriptor {
  role: SemanticRole;
  label: string;
  description?: string;
}

/** A user-editable semantic role. `id` is the stable Mapping key; `label` is
 * freely renamable display text. See `is_role_protected` in Rust. */
export interface EditableRole {
  id: string;
  label: string;
  description?: string;
}
