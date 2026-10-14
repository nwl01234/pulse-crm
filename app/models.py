from sqlalchemy import (Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Float, LargeBinary)
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from enum import Enum

Base = declarative_base()


class RequestStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class PriorityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50))
    hashed_password = Column(String(255), default=None)
    role = Column(String(50), default="employee")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    status = Column(String, default=RequestStatus.NEW.value)
    priority = Column(String, default=PriorityLevel.MEDIUM.value)
    category = Column(String(100))
    assigned_to_id = Column(Integer, ForeignKey("employees.id"))

    ai_summary = Column(Text)
    ai_confidence = Column(Float)

    created_by_id = Column(Integer, ForeignKey("employees.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    is_completed = Column(Boolean, default=False)


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("employees.id"))
    request_id = Column(Integer, ForeignKey("requests.id"))
    action_type = Column(String(50), nullable=False)
    description = Column(Text)
    details = Column(LargeBinary)

    timestamp = Column(DateTime, default=datetime.utcnow)
