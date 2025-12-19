import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import React from "react";

// Error Boundary component to catch and handle errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    
    // Try to clear potentially corrupted localStorage
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log("Cleared corrupted auth data from localStorage");
      
      // Reload the page after clearing storage
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-4 p-6">
            <h1 className="text-2xl font-bold text-destructive">Application Error</h1>
            <p className="text-muted-foreground max-w-md">
              Something went wrong while loading the application. This might be due to corrupted browser data.
            </p>
            <p className="text-sm text-primary">
              Clearing corrupted data and reloading...
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reload Now
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dynamically determine if we are in a development environment
const isDevelopment = import.meta.env.DEV;

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    {/* Conditionally disable StrictMode in development to prevent double rendering issues with Supabase Auth */}
    {isDevelopment ? <App /> : (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )}
  </ErrorBoundary>
);