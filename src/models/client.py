import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()



    self.url = os.getenv("SUPABASE_URL")
    self.key = os.getenv("SUPABASE_KEY")
    self.supabase: Client = create_client(self.url, self.key)
    