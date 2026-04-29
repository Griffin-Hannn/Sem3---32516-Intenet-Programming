from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import urllib.parse

username = urllib.parse.quote_plus("root")
password = urllib.parse.quote_plus("root")
host = "localhost"
port = 27017
auth_source = "admin"
db_name = "mongo_todoApp"
collection_name = "todos"


def build_connection():
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

    db = client[db_name]
    collection = None

    # While MongoDB typically creates databases/collections lazily upon the first insertion, using db.create_collection("name") ensures they are created immediately.
    if collection_name in db.list_collection_names():
        collection = db[collection_name]
    else:
        collection = db.create_collection(collection_name)

    return client, collection
