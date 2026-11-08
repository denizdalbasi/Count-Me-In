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

        response = supabase.table("profiles").select("*").eq("email", email).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found. Please sign up first.")

        user_record = response.data[0]

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



import folium
from fastapi.responses import HTMLResponse

@app.get("/map", response_class=HTMLResponse)
def generate_opportunities_map():
    try:
        response = supabase.table("opportunities").select("*").execute()
        opportunities = response.data

        if not opportunities:
            return "<h3>No active opportunities found to map.</h3>"

        first_opp = opportunities[0]
        center_lat = first_opp.get("latitude") or 43.6532
        center_lon = first_opp.get("longitude") or -79.3832

        m = folium.Map(location=[center_lat, center_lon], zoom_start=12)

        for opp in opportunities:
            lat = opp.get("latitude")
            lon = opp.get("longitude")
            title = opp.get("title", "Volunteer Opportunity")
            location_name = opp.get("location-name") or opp.get("location_name") or "Location TBA"
            description = opp.get("description", "")

            if lat is not None and lon is not None:
                popup_html = f"""
                <div style="font-family: Arial, sans-serif; width: 200px;">
                    <h4 style="margin: 0 0 5px 0; color: #2c3e50;">{title}</h4>
                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #7f8c8d;"><b>Location:</b> {location_name}</p>
                    <p style="margin: 0; font-size: 12px;">{description[:100]}...</p>
                </div>
                """
                
                folium.Marker(
                    location=[lat, lon],
                    popup=folium.Popup(popup_html, max_width=250),
                    tooltip=title,
                    icon=folium.Icon(color="red", icon="heart", prefix="fa")
                ).add_to(m)

        return m._repr_html_()

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))