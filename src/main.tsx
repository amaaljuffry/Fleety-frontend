import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeTheme } from "./utils/themeManager";

// Initialize theme on app startup
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
