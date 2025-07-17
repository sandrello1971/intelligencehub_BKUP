import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="text-2xl font-bold">15</div>
          <div className="text-sm opacity-90">Utenti Totali</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="text-2xl font-bold">1,227</div>
          <div className="text-sm opacity-90">Aziende</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="text-2xl font-bold">32</div>
          <div className="text-sm opacity-90">Documenti</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="text-2xl font-bold">✅</div>
          <div className="text-sm opacity-90">Sistema Operativo</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🚀 IntelligenceHUB v5.0</h2>
        <p className="text-gray-600">
          Sistema di gestione aziendale con AI integrata, CRM sync e documenti RAG.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
