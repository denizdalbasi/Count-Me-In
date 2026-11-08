import os
from typing import *
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta, timezone
import traceback
import folium

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. CRITICAL: Enable CORS so your React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Count Me In API!",
        "docs": "/docs",
        "map": "/map",
        "opportunities": "/opportunities"
    }

@app.get("/opportunities")
def get_opportunities(
    title: Optional[str] = None, 
    categoryId: Optional[str] = None,
    minAge: Optional[int] = None,
    maxAge: Optional[int] = None,
    location: Optional[str] = None,
    created_at: Optional[str] = None,  
    time_filter: Optional[str] = None
):
    try:
        query = supabase.table("opportunities").select("*")

        if title:
            query = query.ilike("title", f"%{title}%")
        if categoryId:
            query = query.eq("category-id", categoryId)
        if minAge is not None:
            query = query.lte("min-age", minAge)  
        if maxAge is not None:
            query = query.gte("max-age", maxAge) 
        if location:
            query = query.ilike("location-name", f"%{location}%")

        if time_filter:
            now = datetime.now(timezone.utc)
            if time_filter == "Last week":
                cutoff = now - timedelta(days=7)
            elif time_filter == "Last month":
                cutoff = now - timedelta(days=30)
            elif time_filter == "Last 24 hours":
                cutoff = now - timedelta(hours=24)
            else:
                cutoff = None

            if cutoff is not None:
                query = query.gte("created_at", cutoff.isoformat())    
        
        response = query.execute()
        opportunities_data = response.data or []

        profiles_response = supabase.table("profiles").select("id, name").execute()
        profiles_map = {p["id"]: p["name"] for p in (profiles_response.data or [])}

        try:
            categories_response = supabase.table("categories").select("id, name").execute()
            categories_map = {c["id"]: c["name"] for c in (categories_response.data or [])}
        except Exception:
            categories_map = {}

        for opp in opportunities_data:
            org_id = opp.get("organization-id") or opp.get("organization_id")
            cat_id = opp.get("category-id") or opp.get("category_id")

            opp["orgName"] = profiles_map.get(org_id, "Unknown Organisation")
            opp["categoryName"] = categories_map.get(cat_id, "General")

            opp.pop("organization-id", None)
            opp.pop("organization_id", None)
            opp.pop("category-id", None)
            opp.pop("category_id", None)

        return opportunities_data

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


    
@app.post("/opportunities")
def create_opportunity(payload: Dict[Any, Any] = Body(...)):
    try:
        payload.pop("id", None)

        # Handle lookup if frontend passes orgName instead of organization-id
        org_name = payload.pop("orgName", None) or payload.pop("org-name", None)
        if org_name and not payload.get("organization-id"):
            profile_match = supabase.table("profiles").select("id").eq("name", org_name).execute()
            if profile_match.data:
                payload["organization-id"] = profile_match.data[0]["id"]

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

@app.get("/map", response_class=HTMLResponse)
def generate_opportunities_map():
    try:
        response = supabase.table("opportunities").select("*").execute()
        opportunities = response.data

        if not opportunities:
            return "<h3>No active opportunities found to map.</h3>"


        first_opp = opportunities[1]
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