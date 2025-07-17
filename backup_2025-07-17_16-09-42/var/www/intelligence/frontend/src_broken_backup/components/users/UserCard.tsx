import React from 'react';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  is_active: boolean;
  crm_id?: number;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      case 'operator': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'manager': return '🎯';
      case 'operator': return '⚙️';
      default: return '👤';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Header con Avatar */}
      <div className="p-6 pb-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
            {user.name.charAt(0)}{user.surname.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {user.name} {user.surname}
            </h3>
            <p className="text-sm text-gray-600">@{user.email.split('@')[0]}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
            {getRoleIcon(user.role)} {user.role}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📧</span>
            <span className="truncate">{user.email}</span>
          </div>
          
          {user.crm_id && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">🏢</span>
              <span>CRM ID: {user.crm_id}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              user.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user.is_active ? '✅ Attivo' : '❌ Inattivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            ✏️ Modifica
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            🗑️ Elimina
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
