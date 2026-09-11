pub mod theme;

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
