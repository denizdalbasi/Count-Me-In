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
@app.post("/applications")
def create_application(payload: Dict[Any, Any] = Body(...)):
    try:
        # Remove any accidental ID
        payload.pop("id", None)

        # Get profile-id and the opportunity name (checking a few possible key names)
        profile_id = payload.get("profile-id") or payload.get("profile_id")
        opportunity_name = payload.get("opportunity-name") or payload.get("opportunity_name") or payload.get("title")

        if not profile_id or not opportunity_name:
            raise HTTPException(status_code=400, detail="profile-id and opportunity-name (or title) are required")

        # 1. Verify that the user profile exists
        profile_check = supabase.table("profiles").select("*").eq("id", profile_id).execute()
        if not profile_check.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        # 2. Look up the opportunity by its title/name to find its real ID
        opp_check = supabase.table("opportunities").select("*").eq("title", opportunity_name).execute()
        if not opp_check.data:
            raise HTTPException(status_code=404, detail=f"Opportunity '{opportunity_name}' not found")

        # Extract the actual ID from the matching opportunity record
        opportunity_record = opp_check.data[0]
        opportunity_id = opportunity_record["id"]

        # 3. Prepare the data row for your form-applications table
        application_data = {
            "profile-id": profile_id,
            "opportunity-id": opportunity_id,
            "message": payload.get("message", "")
        }

        # Insert application into Supabase
        response = supabase.table("form-applications").insert(application_data).execute()
        
        return {
            "message": "Application submitted successfully!",
            "application": response.data[0]
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))