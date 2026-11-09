#  Count Me In — Volunteer Opportunity Finder

**Count Me In** is a web application designed to connect eager volunteers with local community initiatives and organizations. By combining interactive map visualization with tailored search filtering, our platform makes finding and managing volunteer opportunities seamless and accessible.

---

## 💡 What It Does

* 🔍 **Smart Search & Advanced Filtering:** Filter opportunities by age restrictions (`minAge`/`maxAge`), location radius, title keywords, category types, and posting recency (e.g., *Last 24 hours*, *Last week*, *Last month*).
* 🗺️ **Interactive Folium Map Rendering:** Visualizes active volunteer opportunities using custom map markers located at precise geographic coordinates (latitude & longitude) based on the user's selected radius.
* 📋 **Rich Opportunity Listings:** Displays opportunities alongside the interactive map, providing quick summary cards with options to view complete descriptions and contact details.
* ⭐ **Persistent Bookmarking:** Logged-in volunteers can bookmark opportunities to view later, with saved states preserved securely in the cloud database across sessions.
* 🏢 **Organizer Accounts & Opportunity Posting:** Dedicated role-based access allowing organization accounts to create, publish, and manage new volunteer opportunities dynamically.
* 🔐 **Authentication & User Management:** Custom user sign-up, login validation, and profile management for both volunteers and organization reps.

---

## Tech Stack & Architecture

### **Frontend**
* **Framework:** React / Vite
* **Styling:** CSS3 / Modern UI Components
* **Deployment:** Hosted on **Vercel** (`https://count-me-in-inky.vercel.app`)

### **Backend**
* **Framework:** FastAPI (Python 3.12+)
* **Mapping Engine:** Folium (Dynamic HTML rendering)
* **Middleware:** CORS Middleware configured for production client authorization
* **Deployment:** Hosted on **Render** (ASGI execution via Uvicorn)

### **Database & Cloud Services**
* **Database & Auth:** Supabase (PostgreSQL with real-time API bindings)
* **Environment Management:** Secured API keys and database credentials via platform environment variables

---

## 🚀 Architectural Overview & Deployment Pipeline

```
┌─────────────────────────────────┐
│        Vercel Frontend          │
│     (React / Vite Web App)      │
└────────────────┬────────────────┘
                 │ CORS Allowed HTTP Requests
                 ▼
┌─────────────────────────────────┐
│         Render Backend          │
│       (FastAPI / Uvicorn)       │
└────────┬────────────────┬───────┘
         │                │
         │ Queries        │ Generates Map HTML
         ▼                ▼
┌─────────────────┐  ┌──────────────────┐
│ Supabase Cloud  │  │ Dynamic Folium   │
│ (PostgreSQL DB) │  │ Interactive Map │
└─────────────────┘  └──────────────────┘
```


## 📚 Key Takeaways & Lessons Learned

* **Modular Architecture:** Maintaining clean separation between routes, database helpers, and interactive components makes debugging much faster.
* **Version Control Discipline:** Frequent Git commits, pushes, and pulls are essential for keeping team members aligned and preventing merge conflicts.
* **API Communications & CORS:** Gained hands-on experience structuring REST endpoints and configuring cross-origin resource access across different cloud hosting providers.
* **Problem Solving Under Pressure:** Navigating hosting restrictions, environment variable management, and real-time database queries taught us resilience and practical engineering skills.

---

## 👥 Credits & Acknowledgments

A huge thank you to my amazing teammates for making this hackathon an unforgettable experience! 💻✨

#FirstHackathon #Hackathon #SoftwareDevelopment #Teamwork #WebDevelopment #LearningByDoing #TechCommunity
