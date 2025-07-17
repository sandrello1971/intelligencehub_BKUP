import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import UserManagement from './components/users/UserManagement';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('users');
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/v1/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <UserManagement users={users} onUsersChange={loadUsers} />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">🚧 {currentPage} - In Sviluppo</h1>
            <p className="text-gray-600 mt-2">Questa pagina sarà implementata presto.</p>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
