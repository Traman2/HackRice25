from twelvelabs import TwelveLabs
import os
from dotenv import load_dotenv

load_dotenv()

client = TwelveLabs(api_key=os.getenv("TWELVE_API_KEY"))

# Your existing video ID
video_id = "68cee9925705aa6223345a1e"

# Generate a summary
res_summary = client.summarize(
    video_id=video_id,
    type="summary",
    # Optional: you can customize the prompt or temperature
    # prompt="Summarize this video for a Python beginner",
    # temperature=0.2
)

print(f"Video Summary:\n{res_summary.summary}")

# Optional: generate chapters
res_chapters = client.summarize(
    video_id=video_id,
    type="chapter"
)
print("\nChapters:")
for chapter in res_chapters.chapters:
    print(
        f"Chapter {chapter.chapter_number}, "
        f"start={chapter.start_sec}, end={chapter.end_sec}\n"
        f"Title: {chapter.chapter_title}\n"
        f"Summary: {chapter.chapter_summary}\n"
    )

# Optional: generate highlights
res_highlights = client.summarize(
    video_id=video_id,
    type="highlight"
)
print("\nHighlights:")
for highlight in res_highlights.highlights:
    print(f"Highlight: {highlight.highlight}, start: {highlight.start_sec}, end: {highlight.end_sec}")
