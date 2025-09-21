from twelvelabs import TwelveLabs
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

#  TwelveLabs
tl_client = TwelveLabs(api_key=os.getenv("TWELVE_API_KEY"))

# Gemini
client = genai.Client()
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# all the video ids in order
video_ids = ["68ceee675705aa6223346702", "68ceee7bc81f4a8a930376f7","68cf167bc81f4a8a9303b56a" ,"68cf167be23608ddb86eb554" ,"68cf167b4fc8dabea320ee22" , "68cf167a5705aa622334a5e2"]

# beginner, intermediate, inheritance, optional parameters, static , lambda

#loop through and summarize each video
for video_id in video_ids:
    # 3️⃣ Get the summary from TwelveLabs
    res_summary = tl_client.summarize(video_id=video_id, type="summary")
    tl_summary_text = res_summary.summary
    #print("Original TwelveLabs Summary:\n", tl_summary_text, "\n")

    # 4️⃣ Use Gemini to generate a concise summary
    gemini_response = client.models.generate_content(
        model="gemini-2.5-flash",  # or the latest Gemini model
        config=types.GenerateContentConfig(
            temperature=0.7,
        ),
        contents=f"Given a text summary, summarize the following text concisely and make sure not a lot of context is lost.:\n\n{tl_summary_text}",
        
    )

    concise_summary = gemini_response.text
    print("Concise Summary via Gemini:\n", concise_summary)




