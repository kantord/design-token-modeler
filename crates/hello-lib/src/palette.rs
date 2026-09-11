//! Palette/mapping domain logic. The frontend is an editor/previewer only —
//! seed data, ANSI role generation, color resolution, and the referential
//! integrity rules (a role's color surviving palette edits, "neutral" being
//! un-removable) all live here so the TypeScript side never has to know them.

use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashSet};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PaletteColor {
    pub name: String,
    pub hex: String,
}

pub fn default_palette() -> Vec<PaletteColor> {
    [
        ("neutral", "#71717a"),
        ("red", "#ef4444"),
        ("orange", "#f97316"),
        ("blue", "#3b82f6"),
        ("green", "#22c55e"),
        ("yellow", "#eab308"),
    ]
    .into_iter()
    .map(|(name, hex)| PaletteColor {
        name: name.to_string(),
        hex: hex.to_string(),
    })
    .collect()
}

/// A semantic token role the user can add/rename/remove. `id` is the stable
/// mapping key — it never changes after creation, so renaming `label` never
/// breaks `theme_from_mapping`, which only ever reads the "neutral"/"accent"
/// ids. Only the role whose `id` is literally "neutral" is protected from
/// removal (see [`is_role_protected`]).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditableRole {
    pub id: String,
    pub label: String,
    pub description: Option<String>,
}

pub fn default_token_roles() -> Vec<EditableRole> {
    vec![
        EditableRole {
            id: "neutral".to_string(),
            label: "Neutral".to_string(),
            description: Some("Backgrounds, borders, and body text".to_string()),
        },
        EditableRole {
            id: "accent".to_string(),
            label: "Accent".to_string(),
            description: Some("Primary actions and focus rings".to_string()),
        },
    ]
}

/// A fixed (non-editable) role, currently only used for the 16 ANSI slots.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RoleDescriptor {
    pub role: String,
    pub label: String,
    /// Name of the closest-hued color in `default_palette()`, used to seed `default_mapping()`.
    pub default_color_name: String,
}

// The 8 canonical ANSI hues (0-7); each also has a "light"/bright counterpart
// at ANSI 8-15 (e.g. ANSI 2 "Green" / ANSI 10 "Light Green"). The default
// color name is whichever `default_palette()` entry is closest in hue.
const ANSI_BASE: [(&str, &str); 8] = [
    ("Black", "neutral"),
    ("Red", "red"),
    ("Green", "green"),
    ("Yellow", "yellow"),
    ("Blue", "blue"),
    ("Magenta", "red"),
    ("Cyan", "blue"),
    ("White", "neutral"),
];

pub fn ansi_roles() -> Vec<RoleDescriptor> {
    ANSI_BASE
        .iter()
        .enumerate()
        .flat_map(|(i, (name, default_color_name))| {
            vec![
                RoleDescriptor {
                    role: format!("ansi{i}"),
                    label: format!("Terminal {name} (ANSI {i})"),
                    default_color_name: default_color_name.to_string(),
                },
                RoleDescriptor {
                    role: format!("ansi{}", i + 8),
                    label: format!("Terminal Light {name} (ANSI {})", i + 8),
                    default_color_name: default_color_name.to_string(),
                },
            ]
        })
        .collect()
}

pub type Mapping = BTreeMap<String, String>;

pub fn default_mapping() -> Mapping {
    let mut mapping = Mapping::new();
    mapping.insert("neutral".to_string(), "neutral".to_string());
    mapping.insert("accent".to_string(), "blue".to_string());
    for role in ansi_roles() {
        mapping.insert(role.role, role.default_color_name);
    }
    mapping
}

/// Resolves every mapped role to a concrete hex, falling back to the first
/// palette color when a role's chosen color name no longer exists.
pub fn resolve_mapping(mapping: &Mapping, palette: &[PaletteColor]) -> BTreeMap<String, String> {
    let fallback = palette
        .first()
        .map(|c| c.hex.clone())
        .unwrap_or_else(|| "#000000".to_string());
    mapping
        .iter()
        .map(|(role, color_name)| {
            let hex = palette
                .iter()
                .find(|c| &c.name == color_name)
                .map(|c| c.hex.clone())
                .unwrap_or_else(|| fallback.clone());
            (role.clone(), hex)
        })
        .collect()
}

/// True if this role's mapping can never be removed by the user. Keyed by the
/// stable `id`, not the editable `label`, so a rename can't accidentally lift
/// the protection.
pub fn is_role_protected(role_id: &str) -> bool {
    role_id == "neutral"
}

/// Reassigns any mapping entry whose color name no longer exists in `palette`
/// (deleted or never valid) to the first remaining palette color, so
/// referential integrity survives palette edits.
pub fn reconcile_mapping(mapping: &Mapping, palette: &[PaletteColor]) -> Mapping {
    let valid_names: HashSet<&str> = palette.iter().map(|c| c.name.as_str()).collect();
    let fallback = palette.first().map(|c| c.name.clone()).unwrap_or_default();
    mapping
        .iter()
        .map(|(role, color_name)| {
            if valid_names.contains(color_name.as_str()) {
                (role.clone(), color_name.clone())
            } else {
                (role.clone(), fallback.clone())
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_palette_has_six_named_colors_starting_with_neutral() {
        let palette = default_palette();
        assert_eq!(palette.len(), 6);
        assert_eq!(palette[0].name, "neutral");
    }

    #[test]
    fn default_token_roles_seeds_neutral_then_accent() {
        let roles = default_token_roles();
        assert_eq!(roles.iter().map(|r| r.id.as_str()).collect::<Vec<_>>(), ["neutral", "accent"]);
    }

    #[test]
    fn ansi_roles_covers_all_16_slots_base_paired_with_light() {
        let roles = ansi_roles();
        assert_eq!(roles.len(), 16);
        assert_eq!(roles[0].role, "ansi0");
        assert_eq!(roles[1].role, "ansi8");
        assert_eq!(roles[14].role, "ansi7");
        assert_eq!(roles[15].role, "ansi15");
    }

    #[test]
    fn ansi_roles_label_names_the_hue_and_ansi_number() {
        let roles = ansi_roles();
        let green = roles.iter().find(|r| r.role == "ansi2").unwrap();
        assert_eq!(green.label, "Terminal Green (ANSI 2)");
        let light_green = roles.iter().find(|r| r.role == "ansi10").unwrap();
        assert_eq!(light_green.label, "Terminal Light Green (ANSI 10)");
    }

    #[test]
    fn ansi_roles_only_default_to_colors_present_in_default_palette() {
        let names: HashSet<String> = default_palette().into_iter().map(|c| c.name).collect();
        for role in ansi_roles() {
            assert!(names.contains(&role.default_color_name));
        }
    }

    #[test]
    fn default_mapping_has_an_entry_for_every_default_role() {
        let mapping = default_mapping();
        assert_eq!(mapping.get("neutral"), Some(&"neutral".to_string()));
        assert_eq!(mapping.get("accent"), Some(&"blue".to_string()));
        for role in ansi_roles() {
            assert!(mapping.contains_key(&role.role));
        }
    }

    #[test]
    fn resolve_mapping_looks_up_hex_by_color_name() {
        let palette = vec![
            PaletteColor { name: "neutral".into(), hex: "#71717a".into() },
            PaletteColor { name: "blue".into(), hex: "#3b82f6".into() },
        ];
        let mut mapping = Mapping::new();
        mapping.insert("neutral".into(), "neutral".into());
        mapping.insert("accent".into(), "blue".into());

        let resolved = resolve_mapping(&mapping, &palette);
        assert_eq!(resolved.get("neutral"), Some(&"#71717a".to_string()));
        assert_eq!(resolved.get("accent"), Some(&"#3b82f6".to_string()));
    }

    #[test]
    fn resolve_mapping_falls_back_to_first_palette_color_when_name_is_missing() {
        let palette = vec![PaletteColor { name: "neutral".into(), hex: "#71717a".into() }];
        let mut mapping = Mapping::new();
        mapping.insert("accent".into(), "deleted-color".into());

        let resolved = resolve_mapping(&mapping, &palette);
        assert_eq!(resolved.get("accent"), Some(&"#71717a".to_string()));
    }

    #[test]
    fn is_role_protected_is_true_only_for_neutral() {
        assert!(is_role_protected("neutral"));
        assert!(!is_role_protected("accent"));
        assert!(!is_role_protected("role-abc123"));
    }

    #[test]
    fn reconcile_mapping_keeps_entries_whose_color_still_exists() {
        let palette = vec![
            PaletteColor { name: "neutral".into(), hex: "#71717a".into() },
            PaletteColor { name: "blue".into(), hex: "#3b82f6".into() },
        ];
        let mut mapping = Mapping::new();
        mapping.insert("neutral".into(), "neutral".into());
        mapping.insert("accent".into(), "blue".into());

        let reconciled = reconcile_mapping(&mapping, &palette);
        assert_eq!(reconciled, mapping);
    }

    #[test]
    fn reconcile_mapping_reassigns_a_deleted_colors_role_to_the_first_remaining_color() {
        let palette = vec![
            PaletteColor { name: "neutral".into(), hex: "#71717a".into() },
            PaletteColor { name: "blue".into(), hex: "#3b82f6".into() },
        ];
        let mut mapping = Mapping::new();
        mapping.insert("accent".into(), "deleted-color".into());

        let reconciled = reconcile_mapping(&mapping, &palette);
        assert_eq!(reconciled.get("accent"), Some(&"neutral".to_string()));
    }
}
