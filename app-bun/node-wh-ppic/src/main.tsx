import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const savedTheme = localStorage.getItem("wh_ppic_theme") || "dark";
document.documentElement.classList.toggle("dark", savedTheme === "dark");

createRoot(document.getElementById("root")!).render(<App />);
