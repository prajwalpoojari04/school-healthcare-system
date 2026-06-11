import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes/AppRoutes';

const AppDebugLogger = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('[App]', {
      pathname: location.pathname,
      user,
      role: user?.role,
      loading,
    });
  }, [location.pathname, user, loading]);

  return null;
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppDebugLogger />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: 'var(--toast-bg, #1e293b)',
              color: 'var(--toast-color, #f8fafc)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#14b8a6', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
