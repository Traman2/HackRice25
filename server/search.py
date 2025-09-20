from twelvelabs import TwelveLabs
import os
from dotenv import load_dotenv

load_dotenv()
client = TwelveLabs(api_key=os.getenv("TWELVE_API_KEY"))

index_id = "68ceee5ee23608ddb86e76de"

search_pager = client.search.query(
    index_id=index_id,
    query_text="find where exactly the video(s) talks about for loops",  # simpler keyword
    search_options=["visual", "audio"]
)


print("Search results:")
found = False
for clip in search_pager:
    found = True
    start_min = int(clip.start // 60)
    start_sec = int(clip.start % 60)
    end_min = int(clip.end // 60)
    end_sec = int(clip.end % 60)
    print(
        f"Video ID: {clip.video_id}, Start: {start_min}:{start_sec:02}, "
        f"End: {end_min}:{end_sec:02}, Score: {clip.score}, Confidence: {clip.confidence}"
    )

if not found:
    print("No results found. Try using simpler keywords or check your index/video.")
