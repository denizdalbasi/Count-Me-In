import os
import json
from dotenv import *
from supabase import *

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_categories(file: str):
    try:
        with open("test.json", "r", encoding="utf-8") as file:
            categories_data = json.load(file)
    except FileNotFoundError:
        print("Error: 'test.json' file not found.")
        return

    response = supabase.table("categories").insert(categories_data).execute()
    
    print("Upload successful!", response)

if __name__ == "__main__":
    upload_categories()