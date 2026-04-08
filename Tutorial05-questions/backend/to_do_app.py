from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Simple To-Do API")

# Define the origins that are allowed to talk to your server
origins = [
    "http://localhost:3000",  # Default React port
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Default Vite/React port
    "http://127.0.0.1:5173",
]

# Used for pre-built middleware classes (like CORS or GZip)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)


# Data Model
class TodoItem(BaseModel):
    id: int  # use int to match the JavaScript Date.now() output
    text: str
    completed: bool = False


# Define the internal "Database" as a list
todo_db = []

# --- Endpoints ---


@app.get("/todos", response_model=List[TodoItem])
async def get_all_todos():
    """Fetch the entire to-do list."""
    # Add your code here...
    return todo_db


@app.post("/todos", response_model=TodoItem)
async def create_todo(item: TodoItem):
    """Add a new task to the list."""
    # First check if the ID already exists in your 'database'
    # If not, add the item to your 'database'
    # optionally, return the newly added item back to client.
    if any(x.id == item.id for x in todo_db):
        raise HTTPException(status_code=400, detail="ID already exists")
    todo_db.append(item)
    return item

@app.put("/todos/{todo_id}", response_model=TodoItem)
async def update_todo(todo_id: int, updated_item: TodoItem):
    """Update an existing task by its ID."""
    # Add your code here...
    if todo_id != updated_item.id:
        raise HTTPException(status_code=400, detail="ID not match")

    for index, item in enumerate(todo_db):
        if item.id == todo_id:
            todo_db[index] = updated_item
            return updated_item
        
    raise HTTPException(status_code=404, detail="Item not found")
        

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int):
    """Remove a task from the list."""
    # Add your code here...
    for index, item in enumerate(todo_db):
        if item.id == todo_id:
            todo_db.pop(index)
            return {"message": f"Task {todo_id} deleted successfully"}
    raise HTTPException(status_code=404, detail="Task not found")
