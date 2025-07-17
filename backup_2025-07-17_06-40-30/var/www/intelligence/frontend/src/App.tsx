import { AuthProvider } from "./contexts/AuthContext";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Import componenti reali
import Dashboard from './components/dashboard/Dashboard';
import UserManagementComplete from './components/users/UserManagementComplete';
import Companies from './components/companies/Companies';
import IntelliChat from './components/chat/IntelliChat';
import DocumentsRAG from './components/documents/DocumentsRAG';
import WebScraping from './components/webscraping/WebScraping';
import Assessment from './components/assessment/Assessment';
import EmailCenter from './components/email/EmailCenter';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagementComplete />} />
            <Route path="aziende" element={<Companies />} />
            <Route path="articoli" element={<div style={{padding: '40px'}}><h1>📄 Articoli</h1><p>Coming soon...</p></div>} />
            <Route path="kit-commerciali" element={<div style={{padding: '40px'}}><h1>📦 Kit Commerciali</h1><p>Coming soon...</p></div>} />
            <Route path="chat" element={<IntelliChat />} />
            <Route path="documents" element={<DocumentsRAG />} />
            <Route path="web-scraping" element={<WebScraping />} />
            <Route path="assessment" element={<Assessment />} />
            <Route path="email-center" element={<EmailCenter />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
