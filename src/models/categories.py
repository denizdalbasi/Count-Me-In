import json
import supabase

def upload_categories(file: str):
    try:
        with open(file, "r", encoding="utf-8") as file:
            categories_data = json.load(file)
    except FileNotFoundError:
        print("Error: 'test.json' file not found.")
        return

    response = supabase.table("categories").insert(categories_data).execute()
    
    print("Upload successful!", response)