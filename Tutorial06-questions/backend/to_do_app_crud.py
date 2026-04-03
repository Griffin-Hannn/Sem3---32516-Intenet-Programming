from sqlmodel import Field, SQLModel, Session, create_engine, select
from typing import List, Optional

# Establish a db connection
# # Replace these with your actual MySQL settings
username = "root"
password = "root"
database_name = "ass1db"
DATABASE_URL = f"mysql+pymysql://{username}:{password}@localhost:3306/{database_name}"
engine = create_engine(DATABASE_URL, echo=True)


# Create a database table "todo"
class Todo(SQLModel, table=True):
    # Since MySQL's int cannot hold large numbers, you may use 'id: str = Field(max_length=25)' to specify varchar[25] for the id field.
    # # Write your code here...
    id: str = Field(max_length=25)


# Create the database and table as specified by DATABASE_URL and the Todo class (the class can be used to create a db table becuase of this argument configuration: 'table=True').
# If the database and table already exist, it will do nothing to those existing tables
# # Call SQLModel's metadata.create_all() method here...


# Helper function:
# # to_do_app.py uses this generator function to obtain a session using the db connection.
# # It will later pass the session back to the CRUD functions below to perform db operations.
def get_session():
    """Yields a SQLModel Session instance."""
    with Session(engine) as session:
        yield session


# CRUD operations for Todos

# # the create_todo endpoint calls this function to insert records
async def db_create_todo(session: Session, todo_create: Todo) -> Todo:
    # # Write your code here
    return None

# # the get_todo endpoint calls this function to fetch a record by its id field
async def db_get_todo(session: Session, todo_id: int) -> Optional[Todo]:
    # # Write your code here

# # the get_all_todos endpoint calls this function to fetch multiple records (limited to 100 recrods per fetch)
async def db_get_todos(session: Session, skip: int = 0, limit: int = 100) -> List[Todo]:
    # # Write your code here
    return []

# # the update_todo endpoint calls this function to update a record
async def db_update_todo(
    session: Session, todo_id: int, todo_update: Todo
) -> Optional[Todo]:
    # # Write your code here

# # the delete_todo endpoint calls this function to delete a record by its id field
async def db_delete_todo(session: Session, todo_id: int) -> bool:
    # # Write your code here
    return True
