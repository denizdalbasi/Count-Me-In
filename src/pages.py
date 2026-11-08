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


@app.get("/profiles")
def get_all_profiles(): 
    try:
        response = supabase.table("profiles").select("*").execute()
        return response.data
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/signup")
def sign_up_user(payload: Dict[Any, Any] = Body(...)):
    try:
        payload.pop("id", None)
        
        # Check by email since that's your unique identifier
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")

        existing = supabase.table("profiles").select("*").eq("email", email).execute()
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=400, detail="Email is already registered")

        response = supabase.table("profiles").insert(payload).execute()
        return {
            "message": "User registered successfully!",
            "user": response.data[0]
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login_user(payload: Dict[Any, Any] = Body(...)):
    try:
        email = payload.get("email")
        password = payload.get("password") 
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")

        # Query profiles by email
        response = supabase.table("profiles").select("*").eq("email", email).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found. Please sign up first.")

        user_record = response.data[0]

        # Verify password matches
        if user_record.get("password") != password:
            raise HTTPException(status_code=401, detail="Incorrect password.")

        return {
            "message": "Login successful!",
            "user": user_record
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
