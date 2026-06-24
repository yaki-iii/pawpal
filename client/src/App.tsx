import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import FeedPage from './pages/feed/FeedPage';
import PetListPage from './pages/pets/PetListPage';
import PetFormPage from './pages/pets/PetFormPage';
import PetDetailPage from './pages/pets/PetDetailPage';
import ReminderPage from './pages/pets/ReminderPage';
import AIAssistantPage from './pages/ai/AIAssistantPage';
import CircleSquarePage from './pages/community/CircleSquarePage';
import CircleDetailPage from './pages/community/CircleDetailPage';
import PostDetailPage from './pages/community/PostDetailPage';
import ProfilePage from './pages/profile/ProfilePage';

/**
 * Protected route wrapper — redirects to login if not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }): React.ReactNode {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * App — root component with all routes.
 * Public routes: /login, /register
 * Protected routes: all others (wrapped in MainLayout)
 */
export default function App() {
  const { snackbar, closeSnackbar } = useUIStore();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<FeedPage />} />
                  <Route path="/pets" element={<PetListPage />} />
                  <Route path="/pets/new" element={<PetFormPage />} />
                  <Route path="/pets/:id" element={<PetDetailPage />} />
                  <Route path="/pets/:id/edit" element={<PetFormPage />} />
                  <Route path="/reminders" element={<ReminderPage />} />
                  <Route path="/ai" element={<AIAssistantPage />} />
                  <Route path="/circles" element={<CircleSquarePage />} />
                  <Route path="/circles/:id" element={<CircleDetailPage />} />
                  <Route path="/posts/:id" element={<PostDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/:userId" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Global snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
