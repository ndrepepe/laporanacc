import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './integrations/supabase/auth';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider'; // Menggunakan ThemeProvider lokal
import SubmitReport from './pages/SubmitReport';
import ViewReports from './pages/ViewReports';
import Notifications from './pages/Notifications';
import ViewSubordinateReports from './pages/ViewSubordinateReports';
import Summary from './pages/Summary';
import AdminDashboard from './pages/AdminDashboard';
import AddUser from './pages/AddUser';
import AdminRoute from './components/AdminRoute';
import SummaryRoute from './components/SummaryRoute';
import UserManagementRoute from './components/UserManagementRoute';
import NotFound from './pages/NotFound';
import { QueryProvider } from './contexts/QueryContext'; // Import QueryProvider
import { Toaster } from 'sonner'; // Import Toaster from sonner

function App() {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <QueryProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  {/* Protected Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/report/submit" element={<SubmitReport />} />
                  <Route path="/reports/view" element={<ViewReports />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
                  {/* Role-based Protected Routes */}
                  <Route element={<SummaryRoute />}>
                    <Route path="/summary" element={<Summary />} />
                  </Route>
                  
                  <Route element={<UserManagementRoute />}>
                    <Route path="/users/add" element={<AddUser />} />
                  </Route>
                  
                  <Route path="/reports/subordinates" element={<ViewSubordinateReports />} />
                  
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                </Route>
                
                {/* Catch all - 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster richColors position="top-right" />
            </QueryProvider>
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;