import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from supabase import create_client, Client
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
    location: Optional[str] = None
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

        response = query.execute()
        return response.data

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))