import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav className="sidebar">
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1>IntelligenceHUB</h1>
          <p>v5.0 - AI Business Platform</p>
        </div>

        <div style={{ paddingTop: '20px' }}>
          <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-item active' : 'nav-item'}>
            <span>📊</span> Dashboard
          </Link>
          
          <Link to="/users" className={isActive('/users') ? 'nav-item active' : 'nav-item'}>
            <span>👥</span> Gestione Utenti
          </Link>
          
          <Link to="/aziende" className={isActive('/aziende') ? 'nav-item active' : 'nav-item'}>
            <span>🏢</span> Aziende 1.2K
          </Link>
          
          <Link to="/activities" className={isActive('/activities') ? 'nav-item active' : 'nav-item'}>
            <span>📋</span> Attività & Task
          </Link>
          
          <Link to="/chat" className={isActive('/chat') ? 'nav-item active' : 'nav-item'}>
            <span>🤖</span> IntelliChatAI
          </Link>
          
          <Link to="/documents" className={isActive('/documents') ? 'nav-item active' : 'nav-item'}>
            <span>📄</span> Documenti RAG
          </Link>
          
          <Link to="/web-scraping" className={isActive('/web-scraping') ? 'nav-item active' : 'nav-item'}>
            <span>🕷️</span> Web Scraping
          </Link>
          
          <Link to="/assessment" className={isActive('/assessment') ? 'nav-item active' : 'nav-item'}>
            <span>📊</span> Assessment
          </Link>
          
          <Link to="/email-center" className={isActive('/email-center') ? 'nav-item active' : 'nav-item'}>
            <span>📧</span> Email Center
          </Link>
        </div>

        {/* User info at bottom */}
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <div>
            <strong>{user?.email?.split('@')[0] || 'Admin User'}</strong>
            <div style={{ fontSize: '12px', opacity: '0.7' }}>
              {user?.email || 'admin@intelligence.ai'}
            </div>
            <button 
              onClick={handleLogout}
              style={{
                marginTop: '10px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
