from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
_database: AsyncIOMotorDatabase = None


async def init_db():
    global client, _database
    print(f"[DATABASE] Connecting to MongoDB at: {settings.mongodb_url[:40]}...")
    client = AsyncIOMotorClient(settings.mongodb_url)
    _database = client["docRag"]

    # Create indexes for performance
    await _database.documents.create_index("created_at")
    await _database.documents.create_index("status")
    await _database.document_pages.create_index("document_id")
    await _database.chunks.create_index("document_id")

    print("[DATABASE] MongoDB connected and indexes created")


async def close_db():
    global client
    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    return _database


async def get_db() -> AsyncIOMotorDatabase:
    return _database
