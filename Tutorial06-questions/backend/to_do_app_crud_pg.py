from sqlmodel import Field, SQLModel, Session, create_engine, select
from typing import List, Optional

# Establish a db connection
# # Replace these with your actual PostgreSQL settings
username = "pgadmin"
password = "Pg25959281"
database_name = "postgres"
DATABASE_URL = f"postgresql+psycopg2://{username}:{password}@pg-uts-32516-griffin.postgres.database.azure.com:5432/{database_name}?sslmode=require"
engine = create_engine(DATABASE_URL, echo=True)


# Create a database table "todo"
class Todo(SQLModel, table=True):
    # Since PostgreSQL's int can hold large numbers, but this app still uses a string id format,
    # you may use 'id: str = Field(max_length=25)' to specify varchar[25] for the id field.
    # # Write your code here...
    id: str = Field(max_length=25, primary_key=True)
    text: str = Field(max_length=256)
    completed: bool = False


# Create the database and table as specified by DATABASE_URL and the Todo class (the class can be used to create a db table becuase of this argument configuration: 'table=True').
# If the database and table already exist, it will do nothing to those existing tables
# # Call SQLModel's metadata.create_all() method here...
SQLModel.metadata.create_all(engine)


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
    new_todo = Todo.model_validate(todo_create)
    session.add(new_todo)
    return new_todo

# # the get_todo endpoint calls this function to fetch a record by its id field
async def db_get_todo(session: Session, todo_id: str) -> Optional[Todo]:
    # # Write your code here
    return session.get(Todo, todo_id)

# # the get_all_todos endpoint calls this function to fetch multiple records (limited to 100 recrods per fetch)
async def db_get_todos(session: Session, skip: int = 0, limit: int = 100) -> List[Todo]:
    # # Write your code here
    statement = select(Todo).order_by(Todo.id.desc()).offset(skip).limit(limit)
    return session.exec(statement).all()

# # the update_todo endpoint calls this function to update a record
async def db_update_todo(session: Session, todo_id: str, todo_update: Todo) -> Optional[Todo]:
    todo = await db_get_todo(session, todo_id)
    if not todo:
        return None
    update_data = todo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)
    session.add(todo)
    return todo
    

    # # Write your code here

# # the delete_todo endpoint calls this function to delete a record by its id field
async def db_delete_todo(session: Session, todo_id: str) -> bool:
    # # Write your code here
    todo = await db_get_todo(session, todo_id)
    if not todo:
        return False
    session.delete(todo)
    return True