import React, { useState } from 'react';
import UserCard from './UserCard';
import UserModal from './UserModal';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  is_active: boolean;
  crm_id?: number;
}

interface UserManagementProps {
  users: User[];
  onUsersChange: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUsersChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    operator: users.filter(u => u.role === 'operator').length,
    active: users.filter(u => u.is_active).length
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo utente?')) return;
    
    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onUsersChange();
        alert('Utente eliminato con successo!');
      }
    } catch (error) {
      alert('Errore durante l\'eliminazione');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Gestione Utenti</h1>
        <p className="text-gray-600">Gestione completa degli utenti del sistema IntelligenceHUB</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-90">Totale Utenti</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{stats.admin}</div>
          <div className="text-sm opacity-90">Amministratori</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{stats.manager}</div>
          <div className="text-sm opacity-90">Manager</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{stats.operator}</div>
          <div className="text-sm opacity-90">Operatori</div>
        </div>
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{stats.active}</div>
          <div className="text-sm opacity-90">Utenti Attivi</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Cerca utenti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tutti i Ruoli</option>
            <option value="admin">Amministratori</option>
            <option value="manager">Manager</option>
            <option value="operator">Operatori</option>
          </select>

          <button
            onClick={handleCreateUser}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            ➕ Nuovo Utente
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold mb-2">Nessun utente trovato</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || roleFilter !== 'all' 
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia aggiungendo il primo utente al sistema'
            }
          </p>
          <button
            onClick={handleCreateUser}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Aggiungi Primo Utente
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSave={onUsersChange}
        />
      )}
    </div>
  );
};

export default UserManagement;
