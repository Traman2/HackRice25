from twelvelabs import TwelveLabs
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize TwelveLabs
client = TwelveLabs(api_key=os.getenv("TWELVE_API_KEY"))

# List of video IDs
video_ids = [
    "68ceee675705aa6223346702",
    "68ceee7bc81f4a8a930376f7",
    "68cf167bc81f4a8a9303b56a",
    "68cf167be23608ddb86eb554",
    "68cf167b4fc8dabea320ee22",
    "68cf167a5705aa622334a5e2"
]

for video_id in video_ids:
    gist = client.gist(video_id=video_id, types=["title", "hashtag"])
    print(f"Title = {gist.title}")
    print(f"Hashtags = {gist.hashtags}\n")



    



    
