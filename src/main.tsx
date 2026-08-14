import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import appStyles from "./styles.css?inline";

// Keep the demo's visual system in the JavaScript bundle. Some static demo
// deployments have served the React bundle while missing Vite's separate CSS
// asset, leaving a functional but completely unstyled page.
const styleElement = document.createElement("style");
styleElement.dataset.appStyles = "opstrack-demo";
styleElement.textContent = appStyles;
document.head.append(styleElement);

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
