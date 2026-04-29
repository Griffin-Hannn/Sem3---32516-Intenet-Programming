from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

# Configurations for DB connection
username = "root"
password = "root"
host = "localhost"
port = 27017
auth_source = "admin"
db_name = "mongo_todoApp"
collection_name = "todos"

uri = f"mongodb://{username}:{password}@{host}:{port}/?authSource={auth_source}"

# Create a single, shared client instance
client = None
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    print("MongoDB connection successful!")
except ConnectionFailure as e:
    print(f"MongoDB connection failed: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

# Specify the database to connect
db = client[db_name]
collection = None

# If the database and collection already exist, use the exisitng collection within the database;
# Otherwise (any of them does not exist in MongoDB, create the database and collection.
if collection_name in db.list_collection_names():
    collection = db[collection_name]
else:
    collection = db.create_collection(collection_name)
