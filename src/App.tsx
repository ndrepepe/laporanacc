import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./integrations/supabase/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import SubmitReport from "./pages/SubmitReport";
import MyReports from "./pages/ViewReports"; // Renamed import
import ViewSubordinateReports from "./pages/ViewSubordinateReports"; // New import
import Summary from "./pages/Summary";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import SummaryRoute from "./components/SummaryRoute";
import AddUser from "./pages/AddUser"; // New import
import UserManagementRoute from "./components/UserManagementRoute"; // New import
import { ThemeProvider } from "./components/ThemeProvider"; // New import
import { LanguageProvider } from "./contexts/LanguageContext"; // New import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/report/submit" element={<SubmitReport />} />
                  <Route path="/reports/view" element={<MyReports />} /> {/* Updated element name */}
                  <Route path="/reports/subordinates" element={<ViewSubordinateReports />} /> {/* New route */}
                  <Route path="/notifications" element={<Notifications />} />
                  
                  {/* User Management Route (Restricted to Senior Manager & Accounting Manager) */}
                  <Route element={<UserManagementRoute />}>
                    <Route path="/users/add" element={<AddUser />} />
                  </Route>

                  {/* Summary Route (Restricted to Managers) */}
                  <Route element={<SummaryRoute />}>
                    <Route path="/summary" element={<Summary />} />
                  </Route>
                  
                  {/* Admin Routes (Protected by AdminRole check) */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;