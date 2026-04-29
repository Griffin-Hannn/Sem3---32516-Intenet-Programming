from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from mongo_db import collection
from pymongo import ReturnDocument

app = FastAPI(title="Simple To-Do API")

# Define the origins that are allowed to talk to your server
origins = [
    "http://localhost:3000",  # Default React port
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Default Vite/React port
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- Endpoints ---
# Since we create a synchronous client using pymongo (in mongo_db.py file),
# we cannot use await for .find(), .insert_one(), .delete_one(), and .insert_one() methods.
# They are all √ methods.

@app.get("/todos")
async def db_get_todos():
    # The second argument excludes the "_id" field from the result
    # Turn the query cursor (an interable type) into an array of dicts (objects in the eye of JavaScript)

    ## Write your code here...
    return []


@app.post("/todos")
async def db_create_todo(todo: dict):
    # Optionally, we can specify data type for the argument (query parameter)
    # The insertion result does not contain the inserted object;
    # Optionally, we can return the "_id" (assigned by MongoDB) for the inserted object

    ## Write your code here...
    pass

@app.delete("/todos/{todo_id}")
async def db_delete_todo(todo_id: str):
    # You may use the returned result of the delete_one() method to check operation status
    # if result.deleted_count > 0, it means an object was deleted succcessfully

    ## Write your code here...
    pass


@app.put("/todos/{todo_id}")
async def db_update_todo(todo_id: str, todo_obj: dict):
    # You may use collection.find_one_and_update to combine the find and update operations on an same object
    # the "**" operator can be used to unpack todo_obj into a dict, which can be directly used for the update
    pass
