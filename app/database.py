from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from app.config import settings


DATABASE_URL = settings.database_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_size=20,
    max_overflow=10,
)

async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


@event.listens_for(engine, "connect")
def set_sqlite_pragmas(*args, **kwargs):
    dbapi_connection = args[0]
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA busy_timeout=5000")


# @event.listens_for(engine, "disconnect")
# def close_connections(dbapi_connection):
#     dbapi_connection.close()


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


def init_db():
    from app import models
    with engine.begin() as conn:
        models.Base.metadata.create_all(bind=conn)
    print("Database initialized")


def close_db():
    engine.dispose()
