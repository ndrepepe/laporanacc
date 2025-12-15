import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './integrations/supabase/auth';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from 'next-themes'; // Import ThemeProvider

function App() {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              {/* Add other routes here */}
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;