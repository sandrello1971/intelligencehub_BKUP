from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import openai
import json
import time
import uuid
from datetime import datetime

from app.core.database import get_db
from app.routes.auth import get_current_user_dep
from app.schemas.intellichat import (
    ChatRequest, ChatResponse, DocumentContext, 
    ConversationHistory, DocumentSummary, ChatMessage
)
from app.models.users import User
from app.models.knowledge import KnowledgeDocument, DocumentChunk
from app.models.ai_conversation import AIConversation
from app.modules.rag_engine.vector_service import VectorRAGService

router = APIRouter(prefix="/intellichat", tags=["intellichat"])

# Initialize RAG service
rag_service = VectorRAGService()

# Import database service safely
try:
    from app.services.database_service import database_service
    DATABASE_SERVICE_AVAILABLE = True
except ImportError:
    DATABASE_SERVICE_AVAILABLE = False
    print("⚠️ Database service not available - using RAG only")

@router.get("/health")
async def health_check():
    """Health check for IntelliChat"""
    return {
        "status": "healthy",
        "rag_service": "active",
        "database_service": "active" if DATABASE_SERVICE_AVAILABLE else "unavailable",
        "ai_model": "gpt-4",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_rag(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    """Chat con RAG integration + Database enhancement"""
    start_time = time.time()
    
    try:
        # Analizza intent se database service disponibile
        intent = {"needs_database": False, "needs_rag": True, "query_type": "document_search"}
        database_results = None
        
        if DATABASE_SERVICE_AVAILABLE:
            intent = database_service.analyze_query_intent(request.message)
            
            # Query database se necessario
            if intent["needs_database"] and intent["query_type"] == "ai_partner_search":
                database_results = database_service.search_ai_partners(request.message)
        
        # 1. Ricerca documenti rilevanti se richiesto
        sources = []
        context_text = ""
        
        if intent["needs_rag"] and request.include_documents:
            # Ricerca semantica nei documenti
            search_results = await rag_service.search_documents(
                query=request.message,
                company_id=request.company_id,
                limit=request.max_context_docs
            )
            
            # Prepara contesto dai documenti
            for result in search_results:
                doc_context = DocumentContext(
                    document_id=result.get("document_id"),
                    filename=result.get("filename", "Unknown"),
                    content_preview=result.get("content", "")[:500],
                    relevance_score=result.get("score", 0.0)
                )
                sources.append(doc_context)
                
                # Aggiungi al context
                context_text += f"\n\nDocumento: {result.get('filename', 'Unknown')}\n"
                context_text += f"Contenuto: {result.get('content', '')[:1000]}"
        
        # Aggiungi risultati database al context
        if database_results and database_results.get("success"):
            context_text += f"\n\nDati dal database Intelligence:\n"
            context_text += f"Trovati {database_results['results_count']} partner:\n"
            for partner in database_results['partners']:
                context_text += f"- {partner['company_name']} ({partner['sector']})\n"
        
        # 2. Genera risposta con OpenAI
        response_text = await _generate_ai_response(
            query=request.message,
            context=context_text,
            intent=intent,
            database_results=database_results
        )
        
        # 3. Salva conversazione
        conversation = AIConversation(
            user_id=current_user.id,
            company_id=request.company_id,
            user_message=request.message,
            ai_response=response_text,
            context_used=context_text[:2000],  # Limita context salvato
            response_time=time.time() - start_time,
            intent_detected=intent.get("query_type", "unknown"),
            sources_count=len(sources)
        )
        
        db.add(conversation)
        db.commit()
        
        return ChatResponse(
            message=response_text,
            sources=sources,
            response_time=time.time() - start_time,
            conversation_id=str(conversation.id)
        )
        
    except Exception as e:
        error_msg = f"Mi dispiace, ho riscontrato un errore nell'elaborazione: {str(e)}"
        return ChatResponse(
            message=error_msg,
            sources=[],
            response_time=time.time() - start_time,
            conversation_id=""
        )

async def _generate_ai_response(query: str, context: str, intent: dict, database_results: dict = None) -> str:
    """Genera risposta AI con context"""
    try:
        # System prompt basato sull'intent
        if intent.get("query_type") == "ai_partner_search":
            system_prompt = """
            Sei IntelliChat, assistente AI di Intelligence Platform.
            L'utente sta cercando partner che si occupano di AI/tecnologia.
            
            Usa i dati dal database per presentare i partner trovati.
            Rispondi in modo professionale e organizzato.
            """
        else:
            system_prompt = """
            Sei IntelliChat, assistente AI di Intelligence Platform.
            Rispondi alle domande utilizzando le informazioni fornite.
            Sii professionale ma cordiale.
            """
        
        # Chiama OpenAI
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Domanda: {query}\n\nInformazioni disponibili:\n{context}"}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Mi dispiace, ho riscontrato un errore nella generazione della risposta: {str(e)}"

# Mantieni altri endpoint esistenti
@router.get("/conversations/{user_id}")
async def get_user_conversations(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    """Get user conversation history"""
    conversations = db.query(AIConversation).filter(
        AIConversation.user_id == user_id
    ).order_by(AIConversation.created_at.desc()).limit(50).all()
    
    return [
        ConversationHistory(
            id=str(conv.id),
            user_message=conv.user_message,
            ai_response=conv.ai_response,
            timestamp=conv.created_at.isoformat(),
            response_time=conv.response_time
        )
        for conv in conversations
    ]

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_dep)
):
    """Delete a conversation"""
    conversation = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}
