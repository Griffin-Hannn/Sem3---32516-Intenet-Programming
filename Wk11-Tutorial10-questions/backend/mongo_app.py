from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, HTTPException, Depends, Response, status
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from mongo_db import build_connection
from pymongo import ReturnDocument
from contextlib import asynccontextmanager
from pydantic import BaseModel

############################################
# --- Security-related Configurations ---
############################################

# Libraries for password hashing and JWT token handling
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
import jwt

# Liarary for loading environment variables
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Configurations for JWT token handling
SECRET_KEY = os.getenv("SECRET_KEY")  # This is a secret key used to sign JWT tokens.
ALGORITHM = "HS256"  # The algorithm used to sign the JWT tokens
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Set token expiration time (e.g., 30 minutes)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token"
)  # Specify the location of the Login logic, i.e., the '/token' endpoint

############################################
# --- MongoDB connection Management ---
############################################

# Build the MongoDB connection and get the client and collections for todos and users
client, todos_collection, users_collection = build_connection()


# Define the lifespan function to manage MongoDB connection lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    client.close()
    print("MongoDB disconnected.")


app = FastAPI(lifespan=lifespan)  # Pass the lifespan function to the FastAPI instance

############################################
# --- CORS Configuration ---
############################################

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Allows cookies and authentication headers in cross-origin requests
    allow_methods=["*"],
    allow_headers=["*"],
)


############################################
# --- Helper Functions (Security) ---
############################################


# Used for user registration: hash the password before storing it in the database
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")  # Encode password to bytes
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)  # Hash the password
    return hashed.decode("utf-8")


# User for login: verify the provided password against the hashed password stored in DB
def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")  # Encode plain password to bytes
    hashed_bytes = hashed_password.encode("utf-8")  # Encode hashed password to bytes
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)  # Use checkpw to securely compare


# User for login: create a JWT token that includes the username and with  an expiration time
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    payload.update({"exp": expire})
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# This function will be used as dependency in protected routes.
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the payload, which contains the username (under "sub" claim)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        print(f"Decoded token payload: {payload}")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
            )
        return username  # Return the username as the current user
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


############################################
# --- Fake users in the databases ---
############################################


# Simple pydantic model for validating the User Registration Request
class RegisterRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = "user"  # Optional field for user role (e.g., admin, user)


# Helper function to register a user in the database, used for creating predefined users for testing purposes.
# In a real application, you would have a proper registration endpoint and process.
def register_user(data: RegisterRequest):
    existing_user = users_collection.find_one({"username": data.username})
    if existing_user:
        return  # Dothing if user already exists, simply ignore the registration request
    users_collection.insert_one(
        {
            "username": data.username,
            "password": get_password_hash(data.password),
            "role": data.role,  # Default role, can be extended to accept from request
        }
    )
    return {
        "status": "success",
        "message": f"User {data.username} registered successfully!",
    }


# Pre-populate the database with some users for testing purposes.
register_user(
    RegisterRequest(username="admin@example.com", password="admin", role="admin")
)
register_user(
    RegisterRequest(username="testuser@example.com", password="testuser", role="user")
)

############################################
# --- All FastAPI endpoints ---
############################################


# --- Login endpoint to obtain JWT token ---
@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Fetch user from database
    # Write your code here...

    # Check if user exists and password matches
    # Write your code here...

    # Create the JWT token
    # Write your code here...

    # Return the token and username in the response
    # Write your code here...
    return {}


# --- Get all todo items for the current user ---
@app.get("/todos")
async def db_get_todos():
    return todos_collection.find({}, {"_id": 0}).to_list()


# --- Create a new todo item, associating it with the current user ---
@app.post("/todos")
async def db_create_todo(todo: dict):
    result = todos_collection.insert_one(todo)
    return {"id": str(result.inserted_id)}


# --- Delete a todo item by its ID, ensuring that the item belongs to the current user ---
@app.delete("/todos/{todo_id}")
async def db_delete_todo(todo_id: str):
    result = todos_collection.delete_one({"id": todo_id})
    if result.deleted_count == 1:
        return {"message": f"Item with id {todo_id} deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {todo_id} not found",
        )


# --- Update a todo item by its ID, ensuring that the item belongs to the current user ---
@app.put("/todos/{todo_id}")
async def db_update_todo(todo_id: str, todo_obj: dict):
    result = todos_collection.find_one_and_update(
        {"id": todo_id},
        {"$set": todo_obj},
        return_document=ReturnDocument.AFTER,
    )
    if result is not None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {todo_id} not found"
    )
