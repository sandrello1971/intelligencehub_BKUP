import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import UserManagementComplete from './components/users/UserManagementComplete';
import Companies from './components/companies/Companies';
import Activities from './components/activities/Activities';
import IntelliChat from './components/chat/IntelliChat';
import DocumentsRAG from './components/documents/DocumentsRAG';
import WebScraping from './components/webscraping/WebScraping';
import Assessment from './components/assessment/Assessment';
import EmailCenter from './components/email/EmailCenter';

// Tema personalizzato
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Navigate to="/dashboard" replace />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute>
                <MainLayout>
                  <UserManagementComplete />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/companies" element={
              <ProtectedRoute>
                <MainLayout>
                  <Companies />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/activities" element={
              <ProtectedRoute>
                <MainLayout>
                  <Activities />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <MainLayout>
                  <IntelliChat />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/documents" element={
              <ProtectedRoute>
                <MainLayout>
                  <DocumentsRAG />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/web-scraping" element={
              <ProtectedRoute>
                <MainLayout>
                  <WebScraping />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/assessment" element={
              <ProtectedRoute>
                <MainLayout>
                  <Assessment />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/email" element={
              <ProtectedRoute>
                <MainLayout>
                  <EmailCenter />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly>
                <MainLayout>
                  <div>Admin Panel - Coming Soon</div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
