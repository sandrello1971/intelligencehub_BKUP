import React, { useState } from 'react';

const DocumentsRAG: React.FC = () => {
  const [documents] = useState([
    { id: 1, name: 'Manuale_Operativo.pdf', size: '2.1 MB', date: '05/07/2025' },
    { id: 2, name: 'Procedure_Aziendali.docx', size: '847 KB', date: '06/07/2025' },
    { id: 3, name: 'Scheda_Preventivo.pdf', size: '1.4 MB', date: '07/07/2025' }
  ]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Gestione Documenti RAG</h1>
        <p className="text-gray-600">Carica, gestisci e cerca nei tuoi documenti aziendali</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{documents.length}</div>
          <div className="text-sm opacity-90">Documenti Indicizzati</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">5</div>
          <div className="text-sm opacity-90">Formati Supportati</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">4</div>
          <div className="text-sm opacity-90">Stato Sistema</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">✅</div>
          <div className="text-sm opacity-90">Operativo</div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center hover:border-blue-400 transition-colors">
        <div className="text-4xl mb-4">📤</div>
        <h3 className="text-lg font-semibold mb-2">Carica Documenti</h3>
        <p className="text-gray-600 mb-4">Trascina i file qui o clicca per selezionare</p>
        <p className="text-sm text-gray-500">Formati supportati: .pdf, .docx, .xlsx, .txt, .md</p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
          📁 Seleziona File
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">🔍 Ricerca Semantica</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Cerca nei documenti..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
            🔍 Cerca
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">📋 Documenti ({documents.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">📄</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">👁️</button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">⬇️</button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsRAG;
