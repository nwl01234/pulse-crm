from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_
from app.models import (Employee, Request, Task, ActionLog, RequestStatus)
from app.schemas import (
    EmployeeBase, EmployeeCreate, EmployeeUpdate, RequestCreate, RequestUpdate, 
    DashboardStats, TelegramRequestCreate, TelegramStatusUpdate, 
    ActionLogCreate, RequestListResponse, EmployeeListResponse, 
    TaskResponse, TelegramStats, BulkUpdateStatus, BulkAssignEmployees, ActionLogResponse,
    PriorityLevel,
)


async def create_employee(db: AsyncSession, employee_data: EmployeeCreate):
    db_user = Employee(**employee_data.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def get_employee_by_id(db: AsyncSession, emp_id: int):
    return await db.get(Employee, emp_id)


async def list_employees(db: AsyncSession, skip=0, limit=100):
    result = await db.query(Employee).offset(skip).limit(limit).all()
    return [EmployeeListResponse.model_validate(e) for e in result]


async def create_request(db: AsyncSession, request_data: RequestCreate, created_by_id: int):
    request = Request(
        title=request_data.title, description=request_data.description,
        status=request_data.status, priority=request_data.priority,
        category=request_data.category, created_by_id=created_by_id
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


async def get_request_by_id(db: AsyncSession, req_id: int):
    return await db.get(Request, req_id)


async def list_requests(
    db: AsyncSession, status=None, priority=None, category=None, search=None, skip=0, limit=100
):
    query = db.query(Request)
    if status:
        query = query.filter(Request.status == status)
    if priority:
        query = query.filter(Request.priority == priority)
    if category:
        query = query.filter(Request.category.like(f"%{category}%"))
    if search:
        query = query.filter(
            and_(Request.title.ilike(f"%{search}%", Request.description.ilike(f"%{search}%")))
        )

    result = await query.offset(skip).limit(limit).all()
    return [RequestListResponse.model_validate(r) for r in result]


async def update_request(db: AsyncSession, req_id: int, update_data: RequestUpdate):
    request = await get_request_by_id(db, req_id)
    if not request:
        raise ValueError("Request not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(request, key, value)

    await db.commit()
    await db.refresh(request)
    return request


async def delete_request(db: AsyncSession, req_id: int):
    request = await get_request_by_id(db, req_id)
    if not request:
        raise ValueError("Request not found")
    await db.delete(request)
    await db.commit()


async def create_task(db: AsyncSession, request_id: int, task_data):
    request = await get_request_by_id(db, request_id)
    if not request:
        raise ValueError("Request not found")

    task = Task(
        request_id=request_id, title=task_data.title, description=task_data.description
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def get_tasks_by_request(db: AsyncSession, request_id: int):
    result = await db.query(Task).filter(Task.request_id == request_id).all()
    return [TaskResponse.model_validate(t) for t in result]


async def create_action_log(db: AsyncSession, user_id: int, action_data: ActionLogCreate, request_id=None):
    action = ActionLog(
        user_id=user_id, action_type=action_data.action_type,
        description=action_data.description, request_id=request_id
    )
    db.add(action)
    await db.commit()
    await db.refresh(action)
    return action


async def get_action_logs(db: AsyncSession, user_id=None, request_id=None, skip=0, limit=100):
    query = db.query(ActionLog)
    if user_id:
        query = query.filter(ActionLog.user_id == user_id)
    if request_id:
        query = query.filter(ActionLog.request_id == request_id)

    result = await query.offset(skip).limit(limit).all()
    return [ActionLogResponse.model_validate(l) for l in result]


async def get_dashboard_stats(db: AsyncSession, days=7):
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    total_requests = await db.query(Request).count()
    new_requests = await db.query(Request).filter(
        Request.created_at >= cutoff_date, Request.status == RequestStatus.NEW
    ).count()
    in_progress = await db.query(Request).filter(
        Request.status == RequestStatus.IN_PROGRESS
    ).count()

    return DashboardStats(
        total_requests=total_requests,
        new_requests_last_7_days=new_requests,
        in_progress=in_progress,
        done_recently=0
    )


async def generate_ai_summary(db: AsyncSession, request_id: int):
    """Generate AI summary for a request."""
    context = await get_rag_context_for_request(db, request_id)
    summary_text = f"Request about {context['request'].title}"

    return {
        "summary": summary_text,
        "priority_suggestion": "medium",
        "confidence": 0.85
    }


async def get_rag_context_for_request(db: AsyncSession, request_id: int):
    request = await db.get(Request, request_id)
    if not request:
        return {}

    tasks = await db.query(Task).filter(Task.request_id == request_id).all()
    actions = await db.query(ActionLog).filter(
        ActionLog.request_id == request_id
    ).order_by(ActionLog.timestamp.desc()).limit(10).all()

    return {
        "request": RequestListResponse.model_validate(request),
        "tasks": [TaskResponse.model_validate(t) for t in tasks],
        "actions": [ActionLogResponse.model_validate(a) for a in actions]
    }


async def update_employee(db: AsyncSession, emp_id: int, update_data: EmployeeUpdate):
    request = await get_employee_by_id(db, emp_id)
    if not request:
        raise ValueError("Employee not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(request, key, value)

    await db.commit()
    await db.refresh(request)
    return request


async def create_telegram_request(db: AsyncSession, telegram_data: TelegramRequestCreate):
    request = Request(
        title=telegram_data.title, description=telegram_data.description,
        status=RequestStatus.NEW, priority=PriorityLevel.MEDIUM,
        category="Telegram"
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


async def update_telegram_status(db: AsyncSession, telegram_data: TelegramStatusUpdate):
    request = await get_request_by_id(db, telegram_data.request_id)
    if not request:
        raise ValueError("Request not found")

    request.status = RequestStatus(telegram_data.new_status)
    await db.commit()
    return request


async def get_telegram_stats(db: AsyncSession, days=7):
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    total_requests = await db.query(Request).count()
    in_progress = await db.query(Request).filter(
        Request.status == RequestStatus.IN_PROGRESS
    ).count()

    return TelegramStats(
        total_requests=total_requests,
        in_progress=in_progress
    )


async def bulk_update_status(db: AsyncSession, bulk_data: BulkUpdateStatus):
    for req_id in bulk_data.request_ids:
        request = await get_request_by_id(db, req_id)
        if request:
            request.status = RequestStatus(bulk_data.new_status)
    await db.commit()
    return len(bulk_data.request_ids), []


async def bulk_assign_employees(db: AsyncSession, bulk_data: BulkAssignEmployees):
    for req_id in bulk_data.request_ids:
        request = await get_request_by_id(db, req_id)
        if request:
            request.assigned_to_id = bulk_data.employee_id
    await db.commit()
    return len(bulk_data.request_ids), []
