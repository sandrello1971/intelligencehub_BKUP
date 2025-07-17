import React from 'react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', color: '#1976d2' },
    { id: 'users', icon: '👥', label: 'Gestione Utenti', color: '#2e7d32' },
    { id: 'companies', icon: '🏢', label: 'Aziende', color: '#ed6c02' },
    { id: 'activities', icon: '📋', label: 'Attività & Task', color: '#9c27b0' },
    { id: 'chat', icon: '💬', label: 'IntelliChat', color: '#00bcd4' },
    { id: 'documents', icon: '📄', label: 'Documenti RAG', color: '#ff5722' },
    { id: 'webscraping', icon: '🕷️', label: 'Web Scraping', color: '#795548' },
    { id: 'assessment', icon: '📊', label: 'Assessment', color: '#607d8b' },
    { id: 'email', icon: '📧', label: 'Email Center', color: '#e91e63' }
  ];

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="p-6 text-center text-white border-b border-white/20">
        <h1 className="text-xl font-bold mb-1">🧠 IntelligenceHUB</h1>
        <p className="text-xs opacity-75">v5.0 - AI Business Platform</p>
      </div>

      {/* Menu */}
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-lg mb-2 text-left transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-white/20 text-white border-2 border-white/30'
                : 'text-white/80 hover:bg-white/10 hover:text-white border-2 border-transparent'
            }`}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs opacity-75">admin@intelligence.ai</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
