from twelvelabs import TwelveLabs
import os
from dotenv import load_dotenv

load_dotenv()
client = TwelveLabs(api_key=os.getenv("TWELVE_API_KEY"))

indexes = client.indexes.list()  # Fetch all your indexes
for idx in indexes:
    print(f"Index Name: {idx.index_name}, Index ID: {idx.id}")