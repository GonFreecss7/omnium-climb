import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/fonts.css";
import "./styles/reset.css";
import "./styles/theme.css";
import "./styles/global.css";
import "./styles/components.css";

import App from "./App";
import { installSafeBottom } from "./viewport";

installSafeBottom();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
