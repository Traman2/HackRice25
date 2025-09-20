from twelvelabs import TwelveLabs
from twelvelabs.indexes import IndexesCreateRequestModelsItem
from twelvelabs.tasks import TasksRetrieveResponse

import os 
from dotenv import load_dotenv


load_dotenv() 
client = TwelveLabs(api_key= os.getenv("TWELVE_API_KEY"))


index = client.indexes.create( # create an index
    index_name="linearVideooos",
    models=[
        IndexesCreateRequestModelsItem(
            model_name="marengo2.7",
            model_options=["visual", "audio"]
        )
    ]
)


if index.id is None:
    raise RuntimeError("Failed to create an index.")
print(f"Created index: id={index.id}")

task = client.tasks.create( # upload videos
    index_id=index.id, video_url="https://www.dropbox.com/scl/fi/pigym6zqknybkupu5hg6h/LinearVideo.mp4?rlkey=bcpymch9qbcwq1ik7hu9aicaz&st=vygrg3f4&raw=1")
print(f"Created task: id={task.id}")

#monitor indexing
def on_task_update(task: TasksRetrieveResponse):
    print(f"  Status={task.status}")
task = client.tasks.wait_for_done(task_id=task.id, callback=on_task_update)
if task.status != "ready":
    raise RuntimeError(f"Indexing failed with status {task.status}")
print(
    f"Upload complete. The unique identifier of your video is {task.video_id}.")


# perform searches
search_pager = client.search.query(
    index_id=index.id, query_text="What is a vector??", search_options=["visual", "audio"],)


# --- Process results ---
print("Search results:")
for clip in search_results:
    print(
        f"Video ID: {clip.video_id}, Start: {clip.start}, End: {clip.end}, "
        f"Score: {clip.score}, Confidence: {clip.confidence}"
    )
