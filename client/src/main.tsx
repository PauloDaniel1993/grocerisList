import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import App from "./App";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

// Single global <Toaster /> mounted here (outside <App />) so it covers
// every route, including unauthenticated ones like /login.
createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
      <Toaster />
    </BrowserRouter>
  </ThemeProvider>
);
