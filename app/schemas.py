from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
import enum


class PriorityLevel(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RequestStatus(enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime


class RequestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: RequestStatus = RequestStatus.NEW
    priority: PriorityLevel = PriorityLevel.MEDIUM
    category: Optional[str] = None


class RequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[RequestStatus] = None
    priority: Optional[PriorityLevel] = None
    category: Optional[str] = None


class RequestResponse(RequestCreate):
    id: int
    status: RequestStatus
    priority: PriorityLevel
    assigned_to_id: Optional[int]
    ai_summary: Optional[str]
    created_at: datetime


class DashboardStats(BaseModel):
    total_requests: int
    new_requests_last_7_days: int
    in_progress: int
    done_recently: int


class ActionLogCreate(BaseModel):
    action_type: str
    description: Optional[str] = None


class AIChatMessage(BaseModel):
    id: Optional[int] = None
    user_id: int
    request_id: Optional[int] = None
    content: str
    is_ai: bool
    created_at: datetime


class TelegramRequestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: PriorityLevel = PriorityLevel.MEDIUM


class TelegramStatusUpdate(BaseModel):
    request_id: int
    new_status: RequestStatus


class TelegramStats(BaseModel):
    total_requests: int
    in_progress: int


class BulkUpdateStatus(BaseModel):
    request_ids: List[int]
    new_status: RequestStatus


class BulkAssignEmployees(BaseModel):
    request_ids: List[int]
    employee_id: int


class TokenData(BaseModel):
    username: str

class EmployeeListResponse(EmployeeBase):
    id: int
    created_at: datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    request_id: int

class TaskResponse(BaseModel):
    id: int
    request_id: int
    title: str
    description: Optional[str] = None
    is_completed: bool

class RequestListResponse(RequestResponse):
    pass

class ActionLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    request_id: Optional[int]
    action_type: str
    description: Optional[str]
    timestamp: datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshTokenRequest(BaseModel):
    token: str
