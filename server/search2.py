import requests, os
from dotenv import load_dotenv
from twelvelabs import TwelveLabs
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()


from twelvelabs import TwelveLabs
from twelvelabs.indexes import IndexesCreateRequestModelsItem
from twelvelabs.tasks import TasksRetrieveResponse

# 1. Initialize the client
client = TwelveLabs(api_key=os.getenv("TWELVE_API_KEY2"))
index_id = "68cf69453f033d1477506123"


userPrompt = "For loops were explained"  # this one works pretty reliably
#userPrompt = "Im confused about for loops. Find where they were explained"
# 5. Perform a search request
search_pager = client.search.query(
    index_id=index_id,
    query_text=userPrompt,
    search_options=["visual", "audio"],
    # operator="or"
)

count =0
# process the search results and give good time outputs
print("Search results:")
for clip in search_pager:
    count += 1 
    start_min, start_sec = divmod(int(clip.start), 60)
    end_min, end_sec = divmod(int(clip.end), 60)
    print(f"Video ID: {clip.video_id}")
    print(f"Start: {start_min}:{start_sec:02d}")
    print(f"End:   {end_min}:{end_sec:02d}")
    print(f"Score: {clip.score} | Confidence: {clip.confidence}")
    print("-" * 40)
    if count ==1:
        break