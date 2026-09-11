import init, { greeting } from "hello-wasm";

await init();
document.querySelector("#output").textContent = greeting();
