import json
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_json_to_supabase(file_path: str, table_name: str):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            data = [data]  

        print(f"Uploading {len(data)} records to table '{table_name}'...")
        
        response = supabase.table(table_name).upsert(data).execute()
        print("Successfully inserted/updated:", response.data)

    except Exception as e:
        print(f"Error uploading JSON: {e}")

if __name__ == "__main__":
    upload_json_to_supabase("test.json", "opportunities")