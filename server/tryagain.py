import os
import json
from dotenv import load_dotenv
from twelvelabs import TwelveLabs
from twelvelabs.indexes import IndexesCreateRequestModelsItem
import google.generativeai as genai
from twelvelabs.indexes import IndexesCreateRequestModelsItem

load_dotenv()

# ========= CONFIG =========
VIDEO_URL = "https://www.dropbox.com/scl/fi/kbdc6nc9i5jcvxutnrdxb/Learn-Python-in-Less-than-10-Minutes-for-Beginners-Fast-Easy-Indently-1080p-h264-youtube.mp4?rlkey=4lnggcbaysx1256uzymffe90s&st=nyfh4kn2&raw=1"
INDEX_NAME = "coding-videos"
# ==========================

# Initialize clients
client = TwelveLabs(api_key=os.getenv("TWELVE_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# 1. Create an index
index = client.indexes.create(
    IndexesCreateRequest(
        name=INDEX_NAME,
        engines=[
            IndexesCreateRequestModelsItem(
                model_name="marengo2.6",
                model_options=["visual", "conversation"]
            )
        ]
    )
)

# 2. Create video from URL
print("Registering video...")
video = client.videos.create(index_id=index.id, video_url=VIDEO_URL)
print(f"Video registered: {video.id}")

# 3. Get gist (captions + summary + topics)
print("Extracting gist...")
gist = client.gist(video_id=video.id, types=["caption", "summary", "topic"])

captions = ""
if hasattr(gist, "captions") and gist.captions:
    captions = " ".join([c.text for c in gist.captions])

# 4. Search for "file creation" moments
print("Searching for file mentions...")
search_results = client.search(video_id=video.id, query="create a file")

mentions = ""
if hasattr(search_results, "data"):
    mentions = "\n".join([f"{r.timestamp}: {r.text}" for r in search_results.data])

# Combine transcript + mentions
combined_text = f"""
--- TRANSCRIPT ---
{captions}

--- FILE MENTIONS ---
{mentions}
"""

# 5. Send to Gemini for structured JSON extraction
prompt = f"""
You are an AI assistant. Extract all files the instructor creates or opens from the transcript.
Return valid JSON only, with keys: filename, filetype, purpose (if described), and timestamp if available.

Transcript:
{combined_text}
"""

print("Sending to Gemini for JSON extraction...")
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content(prompt)

# Clean response
try:
    json_output = json.loads(response.text)
except Exception:
    json_output = response.text  # fallback if not strict JSON

print("\n===== JSON OUTPUT =====")
print(json_output)

# 6. Save to file
with open("files_created.json", "w") as f:
    if isinstance(json_output, (dict, list)):
        json.dump(json_output, f, indent=2)
    else:
        f.write(str(json_output))

print("✅ Saved as files_created.json")
