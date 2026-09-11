//! Derives a full shadcn/ui design-token palette from a single brand color,
//! using the OKLCH color space so hue/chroma stay perceptually consistent
//! across every derived token.

use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Oklch {
    pub l: f64,
    pub c: f64,
    pub h: f64,
}

/// Parses a `#rgb` or `#rrggbb` hex color into OKLCH.
pub fn hex_to_oklch(hex: &str) -> Result<Oklch, String> {
    let (r, g, b) = hex_to_rgb(hex)?;
    Ok(srgb_to_oklch(r, g, b))
}

fn hex_to_rgb(hex: &str) -> Result<(f64, f64, f64), String> {
    let hex = hex.strip_prefix('#').unwrap_or(hex);
    let expand = |c: char| -> Result<u8, String> {
        c.to_digit(16)
            .map(|d| (d * 16 + d) as u8)
            .ok_or_else(|| format!("invalid hex color: {hex}"))
    };
    let parse_byte = |s: &str| -> Result<u8, String> {
        u8::from_str_radix(s, 16).map_err(|_| format!("invalid hex color: {hex}"))
    };

    let (r, g, b) = match hex.len() {
        3 => {
            let mut chars = hex.chars();
            (
                expand(chars.next().unwrap())?,
                expand(chars.next().unwrap())?,
                expand(chars.next().unwrap())?,
            )
        }
        6 => (
            parse_byte(&hex[0..2])?,
            parse_byte(&hex[2..4])?,
            parse_byte(&hex[4..6])?,
        ),
        _ => return Err(format!("invalid hex color: {hex}")),
    };

    Ok((r as f64 / 255.0, g as f64 / 255.0, b as f64 / 255.0))
}

fn srgb_channel_to_linear(c: f64) -> f64 {
    if c <= 0.04045 {
        c / 12.92
    } else {
        ((c + 0.055) / 1.055).powf(2.4)
    }
}

/// Converts sRGB (0..1 per channel) to OKLCH.
/// Uses Björn Ottosson's OKLab matrices: https://bottosson.github.io/posts/oklab/
fn srgb_to_oklch(r: f64, g: f64, b: f64) -> Oklch {
    let r = srgb_channel_to_linear(r);
    let g = srgb_channel_to_linear(g);
    let b = srgb_channel_to_linear(b);

    let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    let l_ = l.cbrt();
    let m_ = m.cbrt();
    let s_ = s.cbrt();

    let lightness = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    let a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    let b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

    let chroma = (a * a + b2 * b2).sqrt();

    Oklch {
        l: lightness,
        c: chroma,
        h: b2.atan2(a).to_degrees().rem_euclid(360.0),
    }
}

fn fmt_oklch(o: Oklch) -> String {
    format!(
        "oklch({:.4} {:.4} {:.2})",
        o.l.clamp(0.0, 1.0),
        o.c.max(0.0),
        o.h.rem_euclid(360.0)
    )
}

/// A full set of shadcn/ui CSS design tokens, derived from one brand color.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Theme {
    pub background: String,
    pub foreground: String,
    pub card: String,
    pub card_foreground: String,
    pub popover: String,
    pub popover_foreground: String,
    pub primary: String,
    pub primary_foreground: String,
    pub secondary: String,
    pub secondary_foreground: String,
    pub muted: String,
    pub muted_foreground: String,
    pub accent: String,
    pub accent_foreground: String,
    pub destructive: String,
    pub border: String,
    pub input: String,
    pub ring: String,
}

/// Derives a full [`Theme`] from two mapped colors: `neutral` drives the grays
/// (background, foreground, card, muted, border, ...) and `accent` drives the
/// brand tokens (primary, ring, accent). Both are `#rgb` or `#rrggbb` hex.
pub fn theme_from_mapping(neutral_hex: &str, accent_hex: &str) -> Result<Theme, String> {
    let neutral = hex_to_oklch(neutral_hex)?;
    let accent = hex_to_oklch(accent_hex)?;
    let hn = neutral.h;
    let ha = accent.h;
    let tint_neutral = |l: f64, c: f64| Oklch { l, c, h: hn };
    let tint_accent = |l: f64, c: f64| Oklch { l, c, h: ha };

    // Light text on a dark accent, dark text on a light accent.
    let foreground_for_accent = |bg_lightness: f64| {
        if bg_lightness > 0.6 {
            tint_accent(0.145, 0.01)
        } else {
            tint_accent(0.985, 0.01)
        }
    };

    let background = tint_neutral(0.995, 0.002);
    let foreground = tint_neutral(0.145, 0.01);
    let card = background;
    let popover = background;
    let secondary = tint_neutral(0.97, 0.012);
    let secondary_foreground = tint_neutral(0.205, 0.01);
    let muted = tint_neutral(0.97, 0.008);
    let muted_foreground = tint_neutral(0.556, 0.015);
    let accent_bg = tint_accent(0.94, 0.03);
    let accent_foreground = tint_accent(0.205, 0.01);
    // Destructive stays a fixed semantic red, independent of the mapped colors.
    let destructive = Oklch {
        l: 0.577,
        c: 0.245,
        h: 27.325,
    };
    let border = tint_neutral(0.90, 0.015);

    Ok(Theme {
        background: fmt_oklch(background),
        foreground: fmt_oklch(foreground),
        card: fmt_oklch(card),
        card_foreground: fmt_oklch(foreground),
        popover: fmt_oklch(popover),
        popover_foreground: fmt_oklch(foreground),
        primary: fmt_oklch(accent),
        primary_foreground: fmt_oklch(foreground_for_accent(accent.l)),
        secondary: fmt_oklch(secondary),
        secondary_foreground: fmt_oklch(secondary_foreground),
        muted: fmt_oklch(muted),
        muted_foreground: fmt_oklch(muted_foreground),
        accent: fmt_oklch(accent_bg),
        accent_foreground: fmt_oklch(accent_foreground),
        destructive: fmt_oklch(destructive),
        border: fmt_oklch(border),
        input: fmt_oklch(border),
        ring: fmt_oklch(accent),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_six_digit_hex() {
        let oklch = hex_to_oklch("#ff0000").unwrap();
        assert!(oklch.c > 0.2, "red should be highly chromatic: {oklch:?}");
    }

    #[test]
    fn parses_three_digit_hex() {
        let short = hex_to_oklch("#f00").unwrap();
        let long = hex_to_oklch("#ff0000").unwrap();
        assert!((short.l - long.l).abs() < 1e-9);
        assert!((short.c - long.c).abs() < 1e-9);
    }

    #[test]
    fn accepts_hex_without_hash() {
        assert!(hex_to_oklch("6366f1").is_ok());
    }

    #[test]
    fn rejects_invalid_hex() {
        assert!(hex_to_oklch("not-a-color").is_err());
        assert!(hex_to_oklch("#12345").is_err());
    }

    #[test]
    fn black_and_white_have_zero_chroma() {
        let black = hex_to_oklch("#000000").unwrap();
        let white = hex_to_oklch("#ffffff").unwrap();
        assert!(black.l < 0.01);
        assert!(white.l > 0.99);
        assert!(black.c < 1e-6);
        assert!(white.c < 1e-6);
    }

    #[test]
    fn dark_accent_gets_light_foreground() {
        let theme = theme_from_mapping("#888888", "#000000").unwrap();
        assert!(theme.primary_foreground.contains("0.9850"));
    }

    #[test]
    fn light_accent_gets_dark_foreground() {
        let theme = theme_from_mapping("#888888", "#ffffff").unwrap();
        assert!(theme.primary_foreground.contains("0.1450"));
    }

    #[test]
    fn ring_matches_accent() {
        let theme = theme_from_mapping("#888888", "#6366f1").unwrap();
        assert_eq!(theme.ring, theme.primary);
    }

    #[test]
    fn destructive_is_stable_regardless_of_mapping() {
        let a = theme_from_mapping("#888888", "#6366f1").unwrap();
        let b = theme_from_mapping("#71717a", "#22c55e").unwrap();
        assert_eq!(a.destructive, b.destructive);
    }

    #[test]
    fn invalid_neutral_hex_propagates_as_error() {
        assert!(theme_from_mapping("#zzzzzz", "#6366f1").is_err());
    }

    #[test]
    fn invalid_accent_hex_propagates_as_error() {
        assert!(theme_from_mapping("#888888", "#zzzzzz").is_err());
    }

    #[test]
    fn background_hue_tracks_neutral_not_accent() {
        // A neutral with a distinct hue (blue-ish gray) paired with a very
        // differently-hued accent (orange): background should follow neutral's
        // hue, not accent's.
        let theme = theme_from_mapping("#64748b", "#f97316").unwrap();
        let neutral_hue = hex_to_oklch("#64748b").unwrap().h;
        let accent_hue = hex_to_oklch("#f97316").unwrap().h;
        assert!((neutral_hue - accent_hue).abs() > 30.0);
        let rounded_neutral_hue = format!("{neutral_hue:.2}");
        assert!(
            theme.background.contains(&rounded_neutral_hue),
            "expected background {} to carry neutral hue {}",
            theme.background,
            rounded_neutral_hue
        );
    }
}
