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
    cursor = collection.find({}, {"_id": 0})
    # Turn the query cursor (an interable type) into an array of dicts (objects in the eye of JavaScript)
    return [{**item} for item in cursor]


@app.post("/todos")
async def db_create_todo(todo: dict):
    # Optionally, we can specify data type for the argument (query parameter)
    result = collection.insert_one(todo)
    new_id = result.inserted_id
    # The insertion result does not contain the inserted object;
    # Optionally, we can return the "_id" (assigned by MongoDB) for the inserted object
    return {"id": str(new_id)}


@app.delete("/todos/{todo_id}")
async def db_delete_todo(todo_id: str):
    result = collection.delete_one({"id": todo_id})
    if result.deleted_count == 1: # deleted_count > 0 means an object was deleted succcessfully
        return {"message": f"Item with id {todo_id} deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {todo_id} not found",
        )


@app.put("/todos/{todo_id}")
async def db_update_todo(todo_id: str, todo_obj: dict):
    result = collection.find_one_and_update(
        {"id": todo_id},
        {"$set": {**todo_obj}}, # Unpack todo_obj into a dict, which can be used for the update
        return_document=ReturnDocument.AFTER,
    )
    # If the update is successful, a valid resut will be returned.
    if result is not None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    # Otherwise, raise an exception.
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {todo_id} not found"
    )
