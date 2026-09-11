pub mod css;
pub mod palette;
pub mod theme;

pub use css::token_name_from_class;
pub use palette::{
    ansi_roles, default_mapping, default_palette, default_token_roles, is_role_protected,
    reconcile_mapping, resolve_mapping, EditableRole, Mapping, PaletteColor, RoleDescriptor,
};
pub use theme::{theme_from_mapping, Theme};

pub fn greeting() -> String {
    "Hello, world!".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_greets() {
        assert_eq!(greeting(), "Hello, world!");
    }
}
