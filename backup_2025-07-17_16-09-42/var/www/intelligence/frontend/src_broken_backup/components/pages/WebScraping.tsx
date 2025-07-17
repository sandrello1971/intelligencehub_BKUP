import React, { useState, useEffect } from 'react';
import { Globe, Download, Database, AlertCircle, CheckCircle } from 'lucide-react';

interface ScrapingResult {
  success: boolean;
  url: string;
  content?: string;
  title?: string;
  knowledge_document_id?: string;
  chunks_created?: number;
  rag_integrated: boolean;
  message: string;
}

interface WebScrapingStats {
  total_documents: number;
  scraped_documents: number;
  total_chunks: number;
  last_update: string;
  integration_status: string;
}

const WebScraping: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const [stats, setStats] = useState<WebScrapingStats | null>(null);

  // Carica statistiche al mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/web-scraping/status');
      const data = await response.json();
      setStats(data.knowledge_base);
    } catch (error) {
      console.error('Errore caricamento stats:', error);
    }
  };

  const handleScrape = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/web-scraping/scrape-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          auto_rag: true
        })
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        // Ricarica stats dopo successo
        setTimeout(loadStats, 1000);
      }
    } catch (error) {
      console.error('Errore scraping:', error);
      setResult({
        success: false,
        url: url,
        rag_integrated: false,
        message: 'Errore di connessione durante lo scraping'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && url.trim()) {
      handleScrape();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Globe className="mr-3 h-6 w-6 text-blue-600" />
          Web Scraping
        </h1>
        <p className="text-gray-600 mt-2">
          Estrai contenuti da pagine web e aggiungili automaticamente alla knowledge base
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Documenti Totali</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total_documents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600 font-medium">Documenti Scrappati</p>
                <p className="text-2xl font-bold text-green-900">{stats.scraped_documents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Download className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Chunks Totali</p>
                <p className="text-2xl font-bold text-purple-900">{stats.total_chunks}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Status</p>
                <p className="text-sm font-bold text-yellow-900 capitalize">
                  {stats.integration_status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Scraping */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Scrappa Nuova Pagina</h3>
        
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scraping...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Scrappa
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.message}
              </p>
              
              {result.success && (
                <div className="mt-2 space-y-1 text-sm text-green-700">
                  {result.title && <p><strong>Titolo:</strong> {result.title}</p>}
                  {result.knowledge_document_id && (
                    <p><strong>Document ID:</strong> {result.knowledge_document_id}</p>
                  )}
                  {result.chunks_created && (
                    <p><strong>Chunks creati:</strong> {result.chunks_created}</p>
                  )}
                  {result.rag_integrated && (
                    <p className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <strong>Integrato nella Knowledge Base</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebScraping;
