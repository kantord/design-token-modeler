use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greeting() -> String {
    hello_lib::greeting()
}

/// Derives a full shadcn/ui theme (as a plain JS object of CSS variable values)
/// from two mapped colors: `neutralHex` drives the grays, `accentHex` drives
/// the brand tokens. Both are `#rgb` or `#rrggbb` hex.
#[wasm_bindgen(js_name = themeFromColorMapping)]
pub fn theme_from_color_mapping(neutral_hex: &str, accent_hex: &str) -> Result<JsValue, JsValue> {
    hello_lib::theme_from_mapping(neutral_hex, accent_hex)
        .map_err(|err| JsValue::from_str(&err))
        .and_then(|theme| {
            serde_wasm_bindgen::to_value(&theme).map_err(|err| JsValue::from_str(&err.to_string()))
        })
}
