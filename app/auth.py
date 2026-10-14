from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Employee
from app.schemas import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def create_user(db: AsyncSession, user_data, password: str):
    hashed = get_password_hash(password)
    db_user = Employee(**user_data.model_dump(), hashed_password=hashed)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


from sqlalchemy import select

async def authenticate_user(db: AsyncSession, email: str, password: str):
    query = select(Employee).where(Employee.email == email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password, user.hashed_password):
        return None

    access_token_expires = timedelta(minutes=30)
    secret_key = "your-super-secret-key-change-in-production!"
    access_token = jwt.encode(
        {"sub": user.id, "exp": datetime.utcnow() + access_token_expires, "type": "access"},
        secret=secret_key,
        algorithm="HS256"
    )
    return user, access_token


async def refresh_access_token(db: AsyncSession, token: str):
    try:
        payload = jwt.decode(token, "your-super-secret-key-change-in-production!", algorithms=["HS256"])
        user = await db.get(Employee, id=payload["sub"])
        if not user or not verify_password("password", user.hashed_password):
            return None

        access_token_expires = timedelta(minutes=30)
        secret_key = "your-super-secret-key-change-in-production!"
        new_access_token = jwt.encode(
            {"sub": user.id, "exp": datetime.utcnow() + access_token_expires, "type": "access"},
            secret=secret_key,
            algorithm="HS256"
        )
        return new_access_token
    except Exception:
        return None


async def create_admin_user(db: AsyncSession):
    # Check if admin already exists by email
    from sqlalchemy import select
    query = select(Employee).where(Employee.email == "admin@company.com")
    result = await db.execute(query)
    if result.scalar_one_or_none() is None:
        admin = Employee(
            first_name="Admin",
            last_name="User",
            email="admin@company.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        return admin
    return result.scalar_one_or_none()


def get_current_user(token: str):
    try:
        payload = jwt.decode(token, "your-super-secret-key-change-in-production!", algorithms=["HS256"])
        return {"sub": payload.get("sub"), "type": payload.get("type")}
    except Exception:
        return None

