from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import get_settings

settings = get_settings()

# Use the database URL from settings (supports both SQLite and PostgreSQL)
database_url = settings.get_database_url()

# Debug: Print the database URL being used (mask password)
if database_url:
    if "@" in database_url:
        # Mask password for security
        parts = database_url.split("@")
        masked_url = parts[0].rsplit(":", 1)[0] + ":***@" + parts[1]
        print(f"[DATABASE] Using: {masked_url}")
    else:
        print(f"[DATABASE] Using: {database_url}")
else:
    print("[DATABASE] No database URL - this will fail!")

engine = create_async_engine(
    database_url,
    echo=settings.debug,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
