import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import init from "hello-wasm";
import App from "./App";
import "../index.css";

await init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
