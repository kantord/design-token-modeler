use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greeting() -> String {
    hello_lib::greeting()
}
