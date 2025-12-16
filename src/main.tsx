import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import React from "react";

// Dynamically determine if we are in a development environment
// This will be true for local development (npm run dev) and false for production builds
const isDevelopment = import.meta.env.DEV;

createRoot(document.getElementById("root")!).render(
  // Conditionally disable StrictMode in development to prevent double rendering issues with Supabase Auth
  // StrictMode will be enabled in production builds
  isDevelopment ? <App /> : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);