import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import UserManagementComplete from './components/users/UserManagementComplete';
import Activities from './components/activities/Activities';
import IntelliChat from './components/chat/IntelliChat';
import Assessment from './components/assessment/Assessment';

// Tema personalizzato semplificato
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
            
            {/* Protected Routes con MainLayout come parent */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Nested routes - vengono renderizzate in <Outlet /> */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManagementComplete />} />
              <Route path="aziende" element={<div>Aziende Coming Soon</div>} />
              <Route path="activities" element={<Activities />} />
              <Route path="chat" element={<IntelliChat />} />
              <Route path="documents" element={<div>Documenti RAG Coming Soon</div>} />
              <Route path="web-scraping" element={<div>Web Scraping Coming Soon</div>} />
              <Route path="assessment" element={<Assessment />} />
              <Route path="email-center" element={<div>Email Center Coming Soon</div>} />
              <Route path="admin" element={<div>Admin Panel Coming Soon</div>} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
