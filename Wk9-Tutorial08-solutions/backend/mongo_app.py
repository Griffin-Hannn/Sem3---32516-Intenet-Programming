from fastapi import FastAPI, HTTPException, Depends, Response, status
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from mongo_db import build_connection
from bson.objectid import ObjectId
from pymongo import ReturnDocument
from contextlib import asynccontextmanager
from pydantic import BaseModel


client, collection = build_connection()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Things to do upon the FastAPI server starting up
    yield
    # Things to do upon the FastAPI server shutting down.
    client.close()
    print("MongoDB disconnected.")


# Pass the lifespan function to the FastAPI instance
app = FastAPI(lifespan=lifespan)

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


# Simple Data Model for the Login Request
# This pydantic model (optional) will help us validate the incoming JSON data for the login endpoint
class LoginRequest(BaseModel):
    username: str
    password: str


# Our "Database" of users
users_db = {"admin@example.com": "admin", "testuser@example.com": "testuser"}


# -- Endpoints for Users ---


@app.post("/login")
async def login(data: LoginRequest):
    # Retrieve the password for the given username
    stored_password = users_db.get(data.username)

    # Check if user exists and password matches
    if stored_password and stored_password == data.password:
        return {
            "status": "success",
            "message": f"Welcome back, {data.username}!",
            "user": data.username,
            "token": "fake-jwt-token-for-" + data.username,  # In a real app, generate a JWT or similar token
        }

    # If anything fails, throw a 401 Unauthorized error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password"
    )


# --- Endpoints for Todos ---


@app.get("/todos")
async def db_get_todos():
    return collection.find({}, {"_id": 0}).to_list()


@app.post("/todos")
async def db_create_todo(todo: dict):
    result = collection.insert_one(todo)
    new_id = result.inserted_id
    return {"id": str(new_id)}


@app.delete("/todos/{todo_id}")
async def db_delete_todo(todo_id: str):
    result = collection.delete_one({"id": todo_id})
    if result.deleted_count == 1:
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
        {"$set": todo_obj},
        return_document=ReturnDocument.AFTER,
    )
    if result is not None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {todo_id} not found"
    )
