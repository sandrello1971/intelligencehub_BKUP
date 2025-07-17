from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from typing import Optional

router = APIRouter(prefix="/api/v1/companies", tags=["Companies"])

@router.get("/")
async def list_companies(
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """List companies with search"""
    try:
        if search:
            query = """
                SELECT id, name, settore, note, sito_web, is_partner
                FROM companies 
                WHERE LOWER(name) LIKE :search
                ORDER BY name LIMIT :limit
            """
            params = {"search": f"%{search.lower()}%", "limit": limit}
        else:
            query = """
                SELECT id, name, settore, note, sito_web, is_partner
                FROM companies 
                ORDER BY name LIMIT :limit
            """
            params = {"limit": limit}
        
        result = db.execute(text(query), params)
        companies = result.fetchall()
        
        return {
            "companies": [
                {
                    "id": comp.id,
                    "name": comp.name,
                    "settore": comp.settore,
                    "note": comp.note,
                    "sito_web": comp.sito_web,
                    "is_partner": comp.is_partner
                }
                for comp in companies
            ],
            "total": len(companies)
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{company_id}")
async def update_company(company_id: int, company_data: dict, db: Session = Depends(get_db)):
    """Update company"""
    try:
        # Check if exists
        result = db.execute(text("SELECT id FROM companies WHERE id = :id"), {"id": company_id})
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Company not found")
        
        # Update fields
        update_fields = []
        params = {"id": company_id}
        
        for field in ["name", "settore", "note", "sito_web", "indirizzo"]:
            if field in company_data:
                update_fields.append(f"{field} = :{field}")
                params[field] = company_data[field]
        
        if update_fields:
            query = f"UPDATE companies SET {', '.join(update_fields)} WHERE id = :id"
            db.execute(text(query), params)
            db.commit()
            return {"success": True, "message": "Company updated"}
        
        return {"success": False, "message": "No fields to update"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
