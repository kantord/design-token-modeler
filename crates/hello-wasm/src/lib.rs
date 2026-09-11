use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greeting() -> String {
    hello_lib::greeting()
}

/// Derives a full shadcn/ui theme (as a plain JS object of CSS variable values)
/// from two mapped colors: `neutralHex` drives the grays, `accentHex` drives
/// the brand tokens. Both are `#rgb` or `#rrggbb` hex. `dark` picks the
/// light- or dark-mode lightness/chroma table.
#[wasm_bindgen(js_name = themeFromColorMapping)]
pub fn theme_from_color_mapping(
    neutral_hex: &str,
    accent_hex: &str,
    dark: bool,
) -> Result<JsValue, JsValue> {
    hello_lib::theme_from_mapping(neutral_hex, accent_hex, dark)
        .map_err(|err| JsValue::from_str(&err))
        .and_then(|theme| to_js(&theme))
}

// serde_wasm_bindgen's plain `to_value` serializes Rust maps (our `Mapping` =
// BTreeMap<String, String>) as JS `Map` instances, not plain objects — every
// TS call site here treats mappings as `Record<string, string>`, so that
// default would silently make every `mapping.role` lookup `undefined`.
fn to_js<T: Serialize>(value: &T) -> Result<JsValue, JsValue> {
    let serializer = serde_wasm_bindgen::Serializer::new().serialize_maps_as_objects(true);
    value
        .serialize(&serializer)
        .map_err(|err| JsValue::from_str(&err.to_string()))
}

fn from_js<T: for<'de> serde::Deserialize<'de>>(value: JsValue) -> Result<T, JsValue> {
    serde_wasm_bindgen::from_value(value).map_err(|err| JsValue::from_str(&err.to_string()))
}

/// The starting named-color palette: `[{ name, hex }, ...]`.
#[wasm_bindgen(js_name = defaultPalette)]
pub fn default_palette() -> Result<JsValue, JsValue> {
    to_js(&hello_lib::default_palette())
}

/// The starting editable semantic roles (neutral, accent).
#[wasm_bindgen(js_name = defaultTokenRoles)]
pub fn default_token_roles() -> Result<JsValue, JsValue> {
    to_js(&hello_lib::default_token_roles())
}

/// All 16 fixed ANSI terminal roles: `{ role, label, defaultColorName }`.
#[wasm_bindgen(js_name = ansiRoles)]
pub fn ansi_roles() -> Result<JsValue, JsValue> {
    to_js(&hello_lib::ansi_roles())
}

/// The starting role -> color-name mapping (neutral, accent, and all 16 ANSI slots).
#[wasm_bindgen(js_name = defaultMapping)]
pub fn default_mapping() -> Result<JsValue, JsValue> {
    to_js(&hello_lib::default_mapping())
}

/// Resolves every mapped role to a concrete hex, falling back to the first
/// palette color when a role's chosen color name no longer exists.
#[wasm_bindgen(js_name = resolveMapping)]
pub fn resolve_mapping(mapping: JsValue, palette: JsValue) -> Result<JsValue, JsValue> {
    let mapping: hello_lib::Mapping = from_js(mapping)?;
    let palette: Vec<hello_lib::PaletteColor> = from_js(palette)?;
    to_js(&hello_lib::resolve_mapping(&mapping, &palette))
}

/// True if this role can never be removed by the user (only "neutral", by id).
#[wasm_bindgen(js_name = isRoleProtected)]
pub fn is_role_protected(role_id: &str) -> bool {
    hello_lib::is_role_protected(role_id)
}

/// Reassigns any mapping entry whose color name no longer exists in `palette`
/// to the first remaining palette color.
#[wasm_bindgen(js_name = reconcileMapping)]
pub fn reconcile_mapping(mapping: JsValue, palette: JsValue) -> Result<JsValue, JsValue> {
    let mapping: hello_lib::Mapping = from_js(mapping)?;
    let palette: Vec<hello_lib::PaletteColor> = from_js(palette)?;
    to_js(&hello_lib::reconcile_mapping(&mapping, &palette))
}

/// Extracts the CSS variable name a color utility class draws from, e.g.
/// "bg-destructive/10" -> "destructive" (used by the component gallery legend).
#[wasm_bindgen(js_name = tokenNameFromClass)]
pub fn token_name_from_class(class_name: &str) -> String {
    hello_lib::token_name_from_class(class_name)
}
