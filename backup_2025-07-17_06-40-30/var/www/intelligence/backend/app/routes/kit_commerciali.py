"""
Intelligence AI Platform - Kit Commerciali Routes  
API endpoints per gestione kit commerciali e associazione servizi
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db

# FIX: Prefix corretto senza /api/v1 (già incluso nel main.py)
router = APIRouter(prefix="/kit-commerciali", tags=["Kit Commerciali Management"])

# Pydantic Models per validazione
class ServizioInKit(BaseModel):
    articolo_id: int
    quantita: int = 1
    obbligatorio: bool = False
    ordine: int = 0

class KitCommercialeCreate(BaseModel):
    nome: str
    descrizione: Optional[str] = None
    articolo_principale_id: Optional[int] = None
    attivo: bool = True
    servizi: List[ServizioInKit] = []

class KitCommercialeUpdate(BaseModel):
    nome: Optional[str] = None
    descrizione: Optional[str] = None
    attivo: Optional[bool] = None
    servizi: Optional[List[ServizioInKit]] = None

# ==========================================
# ROUTES SPECIFICHE (PRIMA DI /{kit_id})
# ==========================================

@router.get("/health")
async def health_check():
    """Health check per le routes kit commerciali"""
    return {"status": "healthy", "service": "kit-commerciali", "version": "1.0"}

@router.get("/articoli-disponibili")
async def get_articoli_disponibili(db: Session = Depends(get_db)):
    """Lista tutti gli articoli disponibili per aggiungere ai kit - FIX"""
    try:
        # FIX: Query SQL diretta invece di SQLAlchemy model
        query = """
        SELECT 
            id, 
            nome, 
            codice, 
            descrizione, 
            tipo_prodotto, 
            prezzo_listino,
            categoria,
            attivo
        FROM articoli 
        WHERE attivo = true 
        ORDER BY codice
        """
        
        result = db.execute(text(query))
        articoli_data = []
        
        for row in result:
            articoli_data.append({
                "id": row.id,
                "codice": row.codice,
                "nome": row.nome,
                "descrizione": row.descrizione,
                "tipo_prodotto": row.tipo_prodotto,
                "prezzo_listino": float(row.prezzo_listino) if row.prezzo_listino else 0.0,
                "categoria": row.categoria,
                "attivo": row.attivo
            })
        
        return {
            "success": True,
            "count": len(articoli_data),
            "articoli": articoli_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router.get("/articoli-compositi")
async def get_articoli_compositi(db: Session = Depends(get_db)):
    """Lista articoli compositi disponibili per creare kit"""
    try:
        query = """
        SELECT 
            id, 
            nome, 
            codice, 
            descrizione, 
            prezzo_listino,
            categoria
        FROM articoli 
        WHERE tipo_prodotto = 'composito' AND attivo = true 
        ORDER BY codice
        """
        
        result = db.execute(text(query))
        compositi_data = []
        
        for row in result:
            compositi_data.append({
                "id": row.id,
                "codice": row.codice,
                "nome": row.nome,
                "descrizione": row.descrizione,
                "prezzo_listino": float(row.prezzo_listino) if row.prezzo_listino else 0.0,
                "categoria": row.categoria
            })
        
        return {
            "success": True,
            "count": len(compositi_data),
            "articoli_compositi": compositi_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router.get("/servizi-disponibili")
async def get_servizi_disponibili(db: Session = Depends(get_db)):
    """Lista tutti i servizi semplici disponibili per i kit"""
    try:
        query = """
        SELECT id, nome, codice, descrizione, attivo
        FROM articoli 
        WHERE tipo_prodotto = 'semplice' AND attivo = true
        ORDER BY nome
        """
        
        result = db.execute(text(query))
        servizi = []
        
        for row in result:
            servizi.append({
                "id": row.id,
                "nome": row.nome,
                "codice": row.codice,
                "descrizione": row.descrizione,
                "attivo": row.attivo
            })
        
        return {
            "success": True,
            "count": len(servizi),
            "servizi": servizi
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router.get("/stats")
async def get_kit_stats(db: Session = Depends(get_db)):
    """Statistiche kit commerciali"""
    try:
        # Query per contare kit
        total_query = "SELECT COUNT(*) as total FROM kit_commerciali"
        attivi_query = "SELECT COUNT(*) as attivi FROM kit_commerciali WHERE attivo = true"
        
        total_result = db.execute(text(total_query)).scalar()
        attivi_result = db.execute(text(attivi_query)).scalar()
        
        return {
            "success": True,
            "stats": {
                "total_kit": total_result or 0,
                "kit_attivi": attivi_result or 0,
                "kit_inattivi": (total_result or 0) - (attivi_result or 0)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

# ==========================================
# ROUTES GENERICHE (DOPO LE SPECIFICHE)
# ==========================================

@router.get("/")
async def get_kit_commerciali(
    search: Optional[str] = Query(None, description="Cerca per nome"),
    attivo: Optional[bool] = Query(True, description="Filtra per kit attivi"),
    include_servizi: bool = Query(True, description="Include servizi associati"),
    db: Session = Depends(get_db)
):
    """Lista tutti i kit commerciali con servizi associati"""
    try:
        # Query base per kit commerciali
        query = """
        SELECT 
            k.id,
            k.nome,
            k.descrizione,
            k.articolo_principale_id,
            k.attivo,
            k.created_at,
            a.nome as articolo_principale_nome,
            a.codice as articolo_principale_codice
        FROM kit_commerciali k
        LEFT JOIN articoli a ON k.articolo_principale_id = a.id
        WHERE 1=1
        """
        
        params = {}
        
        if attivo is not None:
            query += " AND k.attivo = :attivo"
            params['attivo'] = attivo
            
        if search:
            query += " AND k.nome ILIKE :search"
            params['search'] = f"%{search}%"
            
        query += " ORDER BY k.nome"
        
        result = db.execute(text(query), params)
        kit_list = []
        
        for row in result:
            kit_data = {
                "id": row.id,
                "nome": row.nome,
                "descrizione": row.descrizione,
                "articolo_principale_id": row.articolo_principale_id,
                "articolo_principale": {
                    "nome": row.articolo_principale_nome,
                    "codice": row.articolo_principale_codice
                } if row.articolo_principale_id else None,
                "attivo": row.attivo,
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "servizi": []
            }
            
            # Se richiesto, carica i servizi associati
            if include_servizi:
                servizi_query = """
                SELECT 
                    ka.id as kit_articolo_id,
                    ka.quantita,
                    ka.obbligatorio,
                    ka.ordine,
                    a.id as articolo_id,
                    a.nome,
                    a.codice,
                    a.tipo_prodotto
                FROM kit_articoli ka
                JOIN articoli a ON ka.articolo_id = a.id
                WHERE ka.kit_commerciale_id = :kit_id
                ORDER BY ka.ordine, a.nome
                """
                
                servizi_result = db.execute(text(servizi_query), {"kit_id": row.id})
                
                for servizio_row in servizi_result:
                    kit_data["servizi"].append({
                        "kit_articolo_id": servizio_row.kit_articolo_id,
                        "articolo_id": servizio_row.articolo_id,
                        "nome": servizio_row.nome,
                        "codice": servizio_row.codice,
                        "tipo_prodotto": servizio_row.tipo_prodotto,
                        "quantita": servizio_row.quantita,
                        "obbligatorio": servizio_row.obbligatorio,
                        "ordine": servizio_row.ordine
                    })
            
            kit_list.append(kit_data)
        
        return {
            "success": True,
            "count": len(kit_list),
            "kit_commerciali": kit_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router.get("/{kit_id}")
async def get_kit_by_id(kit_id: int, db: Session = Depends(get_db)):
    """Dettagli kit specifico con articoli inclusi"""
    try:
        # Query kit specifico
        kit_query = """
        SELECT 
            k.id,
            k.nome,
            k.descrizione,
            k.articolo_principale_id,
            k.attivo,
            k.created_at,
            a.nome as articolo_principale_nome,
            a.codice as articolo_principale_codice
        FROM kit_commerciali k
        LEFT JOIN articoli a ON k.articolo_principale_id = a.id
        WHERE k.id = :kit_id
        """
        
        kit_result = db.execute(text(kit_query), {"kit_id": kit_id}).first()
        
        if not kit_result:
            raise HTTPException(status_code=404, detail="Kit non trovato")
        
        # Recupera articoli del kit
        servizi_query = """
        SELECT 
            ka.id as kit_articolo_id,
            ka.quantita,
            ka.obbligatorio,
            ka.ordine,
            a.id as articolo_id,
            a.nome,
            a.codice,
            a.descrizione,
            a.tipo_prodotto,
            a.prezzo_listino
        FROM kit_articoli ka
        JOIN articoli a ON ka.articolo_id = a.id
        WHERE ka.kit_commerciale_id = :kit_id
        ORDER BY ka.ordine, a.nome
        """
        
        servizi_result = db.execute(text(servizi_query), {"kit_id": kit_id})
        
        articoli_data = []
        for servizio_row in servizi_result:
            articoli_data.append({
                "id": servizio_row.kit_articolo_id,
                "articolo_id": servizio_row.articolo_id,
                "articolo_codice": servizio_row.codice,
                "articolo_nome": servizio_row.nome,
                "articolo_descrizione": servizio_row.descrizione,
                "articolo_prezzo": float(servizio_row.prezzo_listino) if servizio_row.prezzo_listino else 0.0,
                "tipo_prodotto": servizio_row.tipo_prodotto,
                "quantita": servizio_row.quantita,
                "obbligatorio": servizio_row.obbligatorio,
                "ordine": servizio_row.ordine
            })
        
        kit_data = {
            "id": kit_result.id,
            "nome": kit_result.nome,
            "descrizione": kit_result.descrizione,
            "articolo_principale_id": kit_result.articolo_principale_id,
            "articolo_principale": {
                "nome": kit_result.articolo_principale_nome,
                "codice": kit_result.articolo_principale_codice
            } if kit_result.articolo_principale_id else None,
            "attivo": kit_result.attivo,
            "articoli": articoli_data,
            "created_at": kit_result.created_at.isoformat() if kit_result.created_at else None
        }
        
        return {
            "success": True,
            "kit": kit_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router.post("/")
async def create_kit_commerciale(kit_data: KitCommercialeCreate, db: Session = Depends(get_db)):
    """Crea nuovo kit commerciale con servizi associati"""
    try:
        # Verifica che il nome non esista già
        existing = db.execute(
            text("SELECT id FROM kit_commerciali WHERE nome = :nome"),
            {"nome": kit_data.nome}
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Nome kit già esistente")
        
        # Verifica articolo principale se specificato
        if kit_data.articolo_principale_id:
            articolo_check = db.execute(
                text("SELECT tipo_prodotto FROM articoli WHERE id = :id AND attivo = true"),
                {"id": kit_data.articolo_principale_id}
            ).first()
            
            if not articolo_check:
                raise HTTPException(status_code=400, detail="Articolo principale non trovato o non attivo")
            
            if articolo_check.tipo_prodotto != 'composito':
                raise HTTPException(status_code=400, detail="L'articolo principale deve essere di tipo 'composito'")
        
        # Crea il kit commerciale
        insert_kit_query = """
        INSERT INTO kit_commerciali (
            nome, descrizione, articolo_principale_id, attivo, created_at
        ) VALUES (
            :nome, :descrizione, :articolo_principale_id, :attivo, CURRENT_TIMESTAMP
        ) RETURNING id
        """
        
        kit_result = db.execute(text(insert_kit_query), {
            "nome": kit_data.nome,
            "descrizione": kit_data.descrizione,
            "articolo_principale_id": kit_data.articolo_principale_id,
            "attivo": kit_data.attivo
        })
        
        kit_id = kit_result.scalar()
        
        # Associa i servizi al kit
        servizi_aggiunti = []
        for servizio in kit_data.servizi:
            # Verifica che il servizio esista e sia semplice
            servizio_check = db.execute(
                text("SELECT nome, tipo_prodotto FROM articoli WHERE id = :id AND attivo = true"),
                {"id": servizio.articolo_id}
            ).first()
            
            if not servizio_check:
                raise HTTPException(status_code=400, detail=f"Servizio ID {servizio.articolo_id} non trovato o non attivo")
            
            if servizio_check.tipo_prodotto != 'semplice':
                raise HTTPException(status_code=400, detail=f"Il servizio '{servizio_check.nome}' deve essere di tipo 'semplice'")
            
            # Inserisci relazione kit-servizio
            insert_servizio_query = """
            INSERT INTO kit_articoli (
                kit_commerciale_id, articolo_id, quantita, 
                obbligatorio, ordine
            ) VALUES (
                :kit_id, :articolo_id, :quantita,
                :obbligatorio, :ordine
            )
            """
            
            db.execute(text(insert_servizio_query), {
                "kit_id": kit_id,
                "articolo_id": servizio.articolo_id,
                "quantita": servizio.quantita,
                "obbligatorio": servizio.obbligatorio,
                "ordine": servizio.ordine
            })
            
            servizi_aggiunti.append({
                "articolo_id": servizio.articolo_id,
                "nome": servizio_check.nome,
                "quantita": servizio.quantita,
                "obbligatorio": servizio.obbligatorio
            })
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Kit commerciale '{kit_data.nome}' creato con successo",
            "kit_id": kit_id,
            "servizi_aggiunti": len(servizi_aggiunti),
            "dettagli_servizi": servizi_aggiunti
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore creazione: {str(e)}")

@router.post("/{kit_id}/articoli")
async def add_articolo_to_kit(
    kit_id: int,
    articolo_data: dict,
    db: Session = Depends(get_db)
):
    """Aggiungi articolo al kit"""
    try:
        # Verifica kit esiste
        kit_check = db.execute(
            text("SELECT nome FROM kit_commerciali WHERE id = :id"),
            {"id": kit_id}
        ).first()
        
        if not kit_check:
            raise HTTPException(status_code=404, detail="Kit non trovato")
        
        # Verifica articolo esiste
        articolo_check = db.execute(
            text("SELECT nome, codice FROM articoli WHERE id = :id AND attivo = true"),
            {"id": articolo_data.get("articolo_id")}
        ).first()
        
        if not articolo_check:
            raise HTTPException(status_code=404, detail="Articolo non trovato o non attivo")
        
        # Verifica duplicati
        existing = db.execute(
            text("SELECT id FROM kit_articoli WHERE kit_commerciale_id = :kit_id AND articolo_id = :articolo_id"),
            {"kit_id": kit_id, "articolo_id": articolo_data.get("articolo_id")}
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Articolo già presente nel kit")
        
        # Inserisci associazione
        insert_query = """
        INSERT INTO kit_articoli (
            kit_commerciale_id, 
            articolo_id, 
            quantita, 
            obbligatorio, 
            ordine
        ) VALUES (
            :kit_id, 
            :articolo_id, 
            :quantita, 
            :obbligatorio, 
            :ordine
        ) RETURNING id
        """
        
        result = db.execute(text(insert_query), {
            "kit_id": kit_id,
            "articolo_id": articolo_data.get("articolo_id"),
            "quantita": articolo_data.get("quantita", 1),
            "obbligatorio": articolo_data.get("obbligatorio", False),
            "ordine": articolo_data.get("ordine", 1)
        })
        
        kit_articolo_id = result.scalar()
        db.commit()
        
        return {
            "success": True,
            "message": f"Articolo {articolo_check.codice} aggiunto al kit {kit_check.nome}",
            "kit_articolo_id": kit_articolo_id
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router.put("/{kit_id}")
async def update_kit_commerciale(kit_id: int, kit_data: KitCommercialeUpdate, db: Session = Depends(get_db)):
    """Aggiorna kit commerciale esistente"""
    try:
        # Verifica che il kit esista
        existing_kit = db.execute(
            text("SELECT nome FROM kit_commerciali WHERE id = :id"),
            {"id": kit_id}
        ).first()
        
        if not existing_kit:
            raise HTTPException(status_code=404, detail="Kit commerciale non trovato")
        
        # Aggiorna i dati del kit
        update_fields = []
        update_params = {"kit_id": kit_id}
        
        if kit_data.nome is not None:
            update_fields.append("nome = :nome")
            update_params["nome"] = kit_data.nome
            
        if kit_data.descrizione is not None:
            update_fields.append("descrizione = :descrizione")
            update_params["descrizione"] = kit_data.descrizione
            
        if kit_data.attivo is not None:
            update_fields.append("attivo = :attivo")
            update_params["attivo"] = kit_data.attivo
        
        if update_fields:
            update_query = f"""
            UPDATE kit_commerciali 
            SET {', '.join(update_fields)}
            WHERE id = :kit_id
            """
            db.execute(text(update_query), update_params)
        
        # Se specificati, aggiorna i servizi
        if kit_data.servizi is not None:
            # Rimuovi associazioni esistenti
            db.execute(
                text("DELETE FROM kit_articoli WHERE kit_commerciale_id = :kit_id"),
                {"kit_id": kit_id}
            )
            
            # Aggiungi nuove associazioni
            for servizio in kit_data.servizi:
                # Verifica servizio
                servizio_check = db.execute(
                    text("SELECT nome, tipo_prodotto FROM articoli WHERE id = :id AND attivo = true"),
                    {"id": servizio.articolo_id}
                ).first()
                
                if not servizio_check:
                    raise HTTPException(status_code=400, detail=f"Servizio ID {servizio.articolo_id} non trovato")
                
                if servizio_check.tipo_prodotto != 'semplice':
                    raise HTTPException(status_code=400, detail=f"Il servizio '{servizio_check.nome}' deve essere di tipo 'semplice'")
                
                # Inserisci nuova associazione
                insert_query = """
                INSERT INTO kit_articoli (
                    kit_commerciale_id, articolo_id, quantita,
                    obbligatorio, ordine
                ) VALUES (
                    :kit_id, :articolo_id, :quantita,
                    :obbligatorio, :ordine
                )
                """
                
                db.execute(text(insert_query), {
                    "kit_id": kit_id,
                    "articolo_id": servizio.articolo_id,
                    "quantita": servizio.quantita,
                    "obbligatorio": servizio.obbligatorio,
                    "ordine": servizio.ordine
                })
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Kit commerciale aggiornato con successo",
            "kit_id": kit_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento: {str(e)}")

@router.delete("/{kit_id}")
async def delete_kit_commerciale(kit_id: int, db: Session = Depends(get_db)):
    """CANCELLA DEFINITIVAMENTE kit commerciale e associazioni"""
    try:
        # Verifica che il kit esista
        existing_kit = db.execute(
            text("SELECT nome FROM kit_commerciali WHERE id = :id"),
            {"id": kit_id}
        ).first()
        
        if not existing_kit:
            raise HTTPException(status_code=404, detail="Kit commerciale non trovato")
        
        kit_nome = existing_kit.nome
        
        # Le associazioni kit_articoli vengono cancellate automaticamente per CASCADE
        # Cancella il kit commerciale
        db.execute(
            text("DELETE FROM kit_commerciali WHERE id = :id"),
            {"id": kit_id}
        )
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Kit commerciale '{kit_nome}' cancellato definitivamente"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Errore cancellazione: {str(e)}")
