//! Small helpers connecting our design tokens to the Tailwind utility classes
//! that consume them (used by the component gallery's color-class legend).

/// Extracts the CSS variable name a color utility class draws from:
/// "bg-destructive/10" -> "destructive"; "text-primary-foreground" -> "primary-foreground".
pub fn token_name_from_class(class_name: &str) -> String {
    let base = class_name.split('/').next().unwrap_or(class_name);
    for prefix in ["bg-", "text-", "border-"] {
        if let Some(stripped) = base.strip_prefix(prefix) {
            return stripped.to_string();
        }
    }
    base.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_bg_prefix() {
        assert_eq!(token_name_from_class("bg-primary"), "primary");
    }

    #[test]
    fn strips_text_prefix() {
        assert_eq!(token_name_from_class("text-primary-foreground"), "primary-foreground");
    }

    #[test]
    fn strips_border_prefix() {
        assert_eq!(token_name_from_class("border-border"), "border");
    }

    #[test]
    fn strips_opacity_modifier() {
        assert_eq!(token_name_from_class("bg-destructive/10"), "destructive");
    }

    #[test]
    fn leaves_unprefixed_names_untouched() {
        assert_eq!(token_name_from_class("foreground"), "foreground");
    }
}
