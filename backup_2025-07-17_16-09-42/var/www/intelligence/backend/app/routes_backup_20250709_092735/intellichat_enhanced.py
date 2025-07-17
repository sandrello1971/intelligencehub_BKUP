"""
🧠 Intellichat Enhanced con Web Scraping Integration
Estende l'intellichat esistente con capacità di scraping URL
"""

import re
import logging
from typing import Optional, List
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class IntellichatURLProcessor:
    """Processore URL per Intellichat"""
    
    def __init__(self):
        self.url_patterns = [
            r'https?://[^\s]+',
            r'www\.[^\s]+',
            r'[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*'
        ]
        
    def extract_urls_from_message(self, message: str) -> List[str]:
        """Estrae URL dal messaggio dell'utente"""
        urls = []
        for pattern in self.url_patterns:
            matches = re.findall(pattern, message, re.IGNORECASE)
            urls.extend(matches)
        
        # Normalizza URL (aggiungi https:// se mancante)
        normalized_urls = []
        for url in urls:
            if not url.startswith(('http://', 'https://')):
                if url.startswith('www.'):
                    url = 'https://' + url
                else:
                    url = 'https://' + url
            normalized_urls.append(url)
            
        return list(set(normalized_urls))  # Rimuovi duplicati
    
    def detect_scraping_intent(self, message: str) -> bool:
        """Rileva se l'utente vuole scrappare contenuti"""
        scraping_keywords = [
            'scrappa', 'scrape', 'estrai', 'analizza sito', 
            'leggi sito', 'importa da', 'carica da web',
            'aggiungi sito', 'scarica contenuto'
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in scraping_keywords)
    
    async def process_url_request(self, message: str, user_id: str) -> dict:
        """
        Processa richiesta con URL dall'intellichat
        Ritorna suggerimenti o esegue scraping automatico
        """
        try:
            urls = self.extract_urls_from_message(message)
            scraping_intent = self.detect_scraping_intent(message)
            
            if not urls:
                return {
                    "has_urls": False,
                    "message": "Nessun URL rilevato nel messaggio"
                }
            
            if scraping_intent:
                # Esegui scraping automatico
                return await self._auto_scrape_urls(urls, user_id)
            else:
                # Suggerisci scraping
                return {
                    "has_urls": True,
                    "urls": urls,
                    "suggestion": f"Ho rilevato {len(urls)} URL nel tuo messaggio. Vuoi che li scrappi per aggiungere il contenuto alla knowledge base?",
                    "auto_scraped": False
                }
                
        except Exception as e:
            logger.error(f"Errore processing URL request: {str(e)}")
            return {
                "error": True,
                "message": f"Errore nell'elaborazione degli URL: {str(e)}"
            }
    
    async def _auto_scrape_urls(self, urls: List[str], user_id: str) -> dict:
        """Esegui scraping automatico degli URL"""
        try:
            from services.web_scraping.api_routes_fixed import scrape_single_url
            from services.web_scraping.knowledge_base_integration_corrected import KnowledgeBaseIntegration
            
            results = []
            
            for url in urls:
                try:
                    # Scrape URL
                    scrape_result = await scrape_single_url(url, auto_rag=True)
                    results.append({
                        "url": url,
                        "success": True,
                        "knowledge_document_id": scrape_result.get("knowledge_document_id"),
                        "message": "Scraping completato con successo"
                    })
                except Exception as e:
                    results.append({
                        "url": url,
                        "success": False,
                        "error": str(e)
                    })
            
            successful_scrapes = len([r for r in results if r["success"]])
            
            return {
                "has_urls": True,
                "urls": urls,
                "auto_scraped": True,
                "results": results,
                "summary": f"Scraping completato: {successful_scrapes}/{len(urls)} URL processati con successo",
                "message": f"✅ Ho aggiunto {successful_scrapes} siti alla knowledge base. Ora posso rispondere alle tue domande utilizzando anche questi contenuti."
            }
            
        except Exception as e:
            logger.error(f"Errore auto scraping: {str(e)}")
            return {
                "error": True,
                "message": f"Errore durante lo scraping automatico: {str(e)}"
            }

# Istanza globale
url_processor = IntellichatURLProcessor()

async def enhance_intellichat_with_urls(message: str, user_id: str) -> dict:
    """
    Funzione helper per integrare URL processing nell'intellichat esistente
    """
    return await url_processor.process_url_request(message, user_id)

