import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Search, 
  AlertCircle,
  CheckCircle,
  Loader,
  Database
} from 'lucide-react';

interface Document {
  filename: string;
  size: number;
  modified: string;
  format: string;
}

interface Stats {
  vector_database: {
    total_points: number;
    status: string;
    collection_name: string;
  };
  supported_formats: string[];
  upload_directory: string;
  status: string;
}

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Carica documenti e stats all'avvio
  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/rag/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Errore caricamento documenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/v1/rag/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Errore caricamento stats:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', '1');
    formData.append('description', `Uploaded: ${file.name}`);

    try {
      const response = await fetch('/api/v1/rag/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadDocuments();
        await loadStats();
        alert('✅ Documento caricato con successo!');
      } else {
        alert('❌ Errore durante il caricamento');
      }
    } catch (error) {
      console.error('Errore upload:', error);
      alert('❌ Errore durante il caricamento');
    } finally {
      setUploading(false);
    }
  };

  
  const handleDelete = async (filename: string) => {
    if (!confirm(`Sei sicuro di voler cancellare il documento: ${filename}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/v1/rag/documents/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('✅ Documento cancellato con successo!');
        await loadDocuments();
        await loadStats();
      } else {
        alert('❌ Errore durante la cancellazione');
      }
    } catch (error) {
      console.error('Errore cancellazione:', error);
      alert('❌ Errore durante la cancellazione');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch('/api/v1/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5,
          score_threshold: 0.7
        }),
      });
      
      const data = await response.json();
      console.log('Risultati ricerca:', data);
      // TODO: Gestire risultati ricerca
    } catch (error) {
      console.error('Errore ricerca:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('it-IT');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📁 Gestione Documenti RAG
        </h1>
        <p className="text-gray-600">
          Carica, gestisci e cerca nei tuoi documenti aziendali
        </p>
      </div>

      {/* Stats Panel */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Statistiche Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.vector_database.total_points}
              </div>
              <div className="text-sm text-gray-600">Documenti Indicizzati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.supported_formats.length}
              </div>
              <div className="text-sm text-gray-600">Formati Supportati</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.status === 'operational' ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Stato Sistema</div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Carica Documenti
        </h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin h-8 w-8 text-blue-500 mr-3" />
              <span className="text-lg">Caricamento in corso...</span>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                Trascina i file qui o clicca per selezionare
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formati supportati: {stats?.supported_formats.join(', ')}
              </p>
              <input
                type="file"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                accept=".pdf,.docx,.xlsx,.txt,.md"
              />
              <label 
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Seleziona File
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Search Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Search className="mr-2 h-5 w-5" />
          Ricerca Semantica
        </h2>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca nei documenti..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {searchLoading ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Cerca
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Documenti ({documents.length})
          </h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin h-8 w-8 text-blue-500 mr-3" />
              <span>Caricamento documenti...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Nessun documento caricato</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.filename}</h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(doc.size)} • {formatDate(doc.modified)} • {doc.format}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    
                    <button 
                      onClick={() => handleDelete(doc.filename)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Cancella documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
