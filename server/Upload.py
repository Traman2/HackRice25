from twelvelabs import TwelveLabs
from twelvelabs.indexes import IndexesCreateRequestModelsItem
from twelvelabs.tasks import TasksRetrieveResponse

import os 
from dotenv import load_dotenv


load_dotenv() 
client = TwelveLabs(api_key= os.getenv("TWELVE_API_KEY"))



index = client.indexes.create(
    index_name="PythonTutorial",
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

task = client.tasks.create(
    index_id=index.id, video_url="https://www.dropbox.com/scl/fi/kbdc6nc9i5jcvxutnrdxb/Learn-Python-in-Less-than-10-Minutes-for-Beginners-Fast-Easy-Indently-1080p-h264-youtube.mp4?rlkey=4lnggcbaysx1256uzymffe90s&st=ogflwk3x&raw=1")
print(f"Created task: id={task.id}")

def on_task_update(task: TasksRetrieveResponse):
    print(f"  Status={task.status}")
task = client.tasks.wait_for_done(task_id=task.id, callback=on_task_update)
if task.status != "ready":
    raise RuntimeError(f"Indexing failed with status {task.status}")
print(
    f"Upload complete. The unique identifier of your video is {task.video_id}.")

#beginner --> 68ceee675705aa6223346702


# intermediate : 68ceee7bc81f4a8a930376f7



