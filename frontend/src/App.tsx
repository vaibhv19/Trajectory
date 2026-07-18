import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ApplicationDetailsPage } from './pages/ApplicationDetailsPage';
import { OutreachPage } from './pages/OutreachPage';
import { ResumesPage } from './pages/ResumesPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { useThemeStore } from './store/themeStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  // Initialize theme trigger
  useThemeStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <HomePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApplicationsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApplicationDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/outreach"
            element={
              <ProtectedRoute>
                <Layout>
                  <OutreachPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/resumes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResumesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Layout>
                  <ResourcesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
