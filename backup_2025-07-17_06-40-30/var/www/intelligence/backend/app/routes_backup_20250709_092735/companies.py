"""
Companies API Routes - Simplified without SQLAlchemy dependencies
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
import os
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/companies", tags=["companies"])

# Database connection
DATABASE_URL = "postgresql://intelligence_user:intelligence_pass@localhost/intelligence"

def get_db_connection():
    """Get direct psycopg2 connection"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

@router.get("/")
async def get_companies(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_partner: Optional[bool] = None,
    is_supplier: Optional[bool] = None,
    partner_category: Optional[str] = None,
    has_website: Optional[bool] = None
):
    """Get companies with filtering"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build query
        filters = []
        params = []
        
        if search:
            filters.append("(name ILIKE %s OR settore ILIKE %s OR partner_description ILIKE %s)")
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        
        if is_partner is not None:
            filters.append("is_partner = %s")
            params.append(is_partner)
            
        if is_supplier is not None:
            filters.append("is_supplier = %s")
            params.append(is_supplier)
            
        if partner_category:
            filters.append("partner_category = %s")
            params.append(partner_category)
            
        if has_website is not None:
            if has_website:
                filters.append("sito_web IS NOT NULL AND sito_web != ''")
            else:
                filters.append("(sito_web IS NULL OR sito_web = '')")
        
        where_clause = "WHERE " + " AND ".join(filters) if filters else ""
        
        # Main query
        query = f"""
        SELECT 
            id, name, partita_iva, settore, sito_web, email, telefono,
            citta, regione, numero_dipendenti,
            COALESCE(is_partner, false) as is_partner, 
            COALESCE(is_supplier, false) as is_supplier, 
            partner_category, partner_description,
            partner_expertise, COALESCE(partner_rating, 0) as partner_rating, 
            COALESCE(partner_status, 'active') as partner_status,
            last_scraped_at, COALESCE(scraping_status, 'pending') as scraping_status
        FROM companies 
        {where_clause}
        ORDER BY is_partner DESC NULLS LAST, is_supplier DESC NULLS LAST, name
        LIMIT %s OFFSET %s
        """
        
        params.extend([limit, skip])
        cursor.execute(query, params)
        companies = cursor.fetchall()
        
        # Count query
        count_query = f"SELECT COUNT(*) FROM companies {where_clause}"
        cursor.execute(count_query, params[:-2])  # Remove limit/offset
        total = cursor.fetchone()['count']
        
        # Stats query
        stats_query = """
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN is_partner = true THEN 1 END) as partners,
            COUNT(CASE WHEN is_supplier = true THEN 1 END) as suppliers,
            COUNT(CASE WHEN sito_web IS NOT NULL AND sito_web != '' THEN 1 END) as with_website,
            COUNT(CASE WHEN scraping_status = 'completed' THEN 1 END) as scraped
        FROM companies
        """
        cursor.execute(stats_query)
        stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return {
            "companies": [dict(company) for company in companies],
            "total": total,
            "stats": dict(stats)
        }
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{company_id}")
async def get_company(company_id: int):
    """Get single company with full details"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM companies WHERE id = %s"
        cursor.execute(query, (company_id,))
        company = cursor.fetchone()
        
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
            
        # Get scraped content stats
        scraped_query = """
        SELECT COUNT(*) as scraped_documents
        FROM scraped_websites sw
        WHERE sw.company_id = %s
        """
        cursor.execute(scraped_query, (company_id,))
        scraped_stats = cursor.fetchone()
        
        result = dict(company)
        result["scraped_stats"] = dict(scraped_stats) if scraped_stats else {"scraped_documents": 0}
        
        cursor.close()
        conn.close()
        
        return result
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/{company_id}/partner")
async def update_partner_status(company_id: int, partner_data: dict):
    """Update partner/supplier status and details"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build update fields
        update_fields = []
        params = []
        
        allowed_fields = ["is_partner", "is_supplier", "partner_category", 
                         "partner_description", "partner_expertise", "partner_rating"]
        
        for field in allowed_fields:
            if field in partner_data:
                update_fields.append(f"{field} = %s")
                params.append(partner_data[field])
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        params.append(company_id)
        
        query = f"""
        UPDATE companies 
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, name, is_partner, is_supplier, partner_category
        """
        
        cursor.execute(query, params)
        updated = cursor.fetchone()
        
        if not updated:
            raise HTTPException(status_code=404, detail="Company not found")
            
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": "Partner status updated", "company": dict(updated)}
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/{company_id}/scrape")
async def trigger_scraping(company_id: int):
    """Trigger website scraping for company"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get company website
        query = "SELECT name, sito_web FROM companies WHERE id = %s"
        cursor.execute(query, (company_id,))
        company = cursor.fetchone()
        
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
            
        if not company['sito_web']:
            raise HTTPException(status_code=400, detail="Company has no website")
        
        # Update scraping status
        update_query = """
        UPDATE companies 
        SET scraping_status = 'pending', last_scraped_at = NOW()
        WHERE id = %s
        """
        cursor.execute(update_query, (company_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return {
            "message": f"Scraping started for {company['name']}",
            "website": company['sito_web'],
            "status": "pending"
        }
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/search/partners")
async def search_partners(
    query: str = Query(..., description="Search query for partners"),
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    location: Optional[str] = None
):
    """AI-powered partner search"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build filters
        filters = ["is_partner = true"]
        params = []
        
        if query:
            filters.append("(name ILIKE %s OR partner_description ILIKE %s OR settore ILIKE %s)")
            params.extend([f"%{query}%", f"%{query}%", f"%{query}%"])
        
        if category:
            filters.append("partner_category = %s")
            params.append(category)
            
        if min_rating:
            filters.append("partner_rating >= %s")
            params.append(min_rating)
            
        if location:
            filters.append("(citta ILIKE %s OR regione ILIKE %s)")
            params.extend([f"%{location}%", f"%{location}%"])
        
        search_query = f"""
        SELECT 
            id, name, settore, partner_category, partner_description,
            partner_expertise, partner_rating, sito_web, citta, regione,
            scraping_status, ai_analysis_summary
        FROM companies 
        WHERE {' AND '.join(filters)}
        ORDER BY partner_rating DESC NULLS LAST, name
        LIMIT 20
        """
        
        cursor.execute(search_query, params)
        partners = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            "query": query,
            "partners": [dict(partner) for partner in partners],
            "count": len(partners)
        }
        
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
