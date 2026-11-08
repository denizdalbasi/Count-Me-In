import os
from typing import *
from fastapi import *
from dotenv import *
from supabase import *
import traceback

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

@app.get("/opportunities")
def get_opportunities(
    title: Optional[str] = None, 
    minAge: Optional[int] = None,
    maxAge: Optional[int] = None,
    location: Optional[str] = None,
    created_at: Optional[str] = None
):
    try:
        query = supabase.table("opportunities").select("*")

        if title:
            query = query.ilike("title", f"%{title}%")
        if minAge:
            query = query.gte("min_age", minAge)
        if maxAge:
            query = query.lte("max_age", maxAge)
        if location:
            query = query.ilike("location", f"%{location}%")
        if created_at:
            query = query.ilike("created_at", f"%{created_at}%")

        response = query.execute()
        return response.data

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/opportunities")
def create_opportunity(payload: Dict[Any, Any] = Body(...)):
    try:
        payload.pop("id", None)

        response = supabase.table("opportunities").insert(payload).execute()
        return {
            "message": "Opportunity created successfully!", 
            "data": response.data
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))