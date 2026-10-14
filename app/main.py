from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
import os

from app.config import settings
from app.database import engine, init_db, close_db, get_db, async_session_factory
from app.models import Base, Employee, Request as DBRequest, Task, ActionLog, RequestStatus
from app.auth import get_current_user, verify_password, pwd_context, create_admin_user, authenticate_user, refresh_access_token
from app.schemas import (EmployeeBase, EmployeeCreate, EmployeeUpdate, RequestCreate, RequestUpdate, RequestListResponse, TaskResponse, DashboardStats, AIChatMessage, TelegramRequestCreate, TelegramStatusUpdate, LoginRequest, RefreshTokenRequest, TaskCreate, BulkUpdateStatus, BulkAssignEmployees)
from app.crud import (create_employee, update_employee, list_employees, get_employee_by_id, create_request, update_request, delete_request, list_requests, get_request_by_id, create_task, get_tasks_by_request, create_action_log, get_action_logs, get_dashboard_stats, generate_ai_summary, create_telegram_request, update_telegram_status, get_telegram_stats, bulk_update_status, bulk_assign_employees, get_rag_context_for_request)
from sqlalchemy import and_, select

import app.auth as auth

app = FastAPI(title="Company CRM", description="Internal company CRM system with AI features", version="1.0.0")
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "..", "templates"))


@app.on_event("startup")
async def startup():
    init_db()
    async with async_session_factory() as session:
        await auth.create_admin_user(session)
    print("CRM application started!")


@app.on_event("shutdown")
def shutdown():
    close_db()


@app.get("/")
async def dashboard(request: Request, db: AsyncSession = Depends(get_db)):
    stats = await get_dashboard_stats(db)
    requests = await list_requests(db, skip=0, limit=10)
    return templates.TemplateResponse("index.html", {
        "requests": requests,
        "stats": stats
    })


@app.post("/setup/admin")
async def create_admin(db: AsyncSession = Depends(get_db)):
    from app.auth import create_admin_user
    await create_admin_user(db)
    return {"message": "Admin user 'admin@company.com' created with password 'admin123'"}


@app.get("/login")
async def login_page():
    return templates.TemplateResponse("login.html", {})


@app.post("/auth/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user, access_token = await authenticate_user(db, email=data.email, password=data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"username": user.email, "access_token": access_token}


@app.post("/auth/refresh")
async def refresh_access_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    new_access = await refresh_access_token(db, data.token)
    if not new_access:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    return {"access_token": new_access}


@app.get("/api/admin/employees", response_model=list[EmployeeUpdate])
async def get_admin_employees(skip=0, limit=100, db: AsyncSession = Depends(get_db)):
    return await list_employees(db, skip=skip, limit=limit)


@app.post("/api/admin/employees")
async def create_employee_endpoint(employee_data: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    return await create_employee(db, employee_data=employee_data)


@app.get("/api/requests", response_model=list[RequestListResponse])
async def get_requests(status=None, priority=None, category=None, search=None, skip=0, limit=100, db: AsyncSession = Depends(get_db)):
    status_enum = RequestStatus(status) if status else None
    return await list_requests(db, status=status_enum, limit=limit)


@app.get("/api/requests/{req_id}")
async def get_request(req_id: int, db: AsyncSession = Depends(get_db)):
    return await get_request_by_id(db, req_id=req_id)


@app.post("/api/requests")
async def create_request_endpoint(request_data: RequestCreate, db: AsyncSession = Depends(get_db)):
    return await create_request(db, request_data=request_data, created_by_id=-1)


@app.put("/api/requests/{req_id}")
async def update_request_endpoint(req_id: int, request_data: RequestUpdate, db: AsyncSession = Depends(get_db)):
    return await update_request(db, req_id=req_id, update_data=request_data)


@app.delete("/api/requests/{req_id}")
async def delete_request_endpoint(req_id: int, db: AsyncSession = Depends(get_db)):
    return await delete_request(db, req_id=req_id)


@app.post("/api/tasks")
async def create_task_endpoint(task_data: TaskCreate, db: AsyncSession = Depends(get_db)):
    return await create_task(db, request_id=task_data.request_id, task_data=task_data)


@app.get("/api/tasks/{request_id}", response_model=list[TaskResponse])
async def get_tasks_for_request(request_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.request_id == request_id))
    tasks = result.scalars().all()
    return [
        TaskResponse(
            id=t.id,
            title=t.title,
            description=t.description,
            is_completed=t.is_completed
        )
        for t in tasks
    ]


@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(days=7, db: AsyncSession = Depends(get_db)):
    return await get_dashboard_stats(db, days=days)


@app.post("/api/ai/analyze-request/{req_id}")
async def analyze_request_with_ai(req_id: int, db: AsyncSession = Depends(get_db)):
    try:
        analysis = await generate_ai_summary(db, request_id=req_id)
        return {
            "request_id": req_id,
            "ai_summary": analysis["summary"],
            "suggested_priority": analysis["priority_suggestion"],
            "confidence": analysis.get("confidence")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@app.post("/api/ai/chat")
async def ai_chat(chat_data: AIChatMessage, db: AsyncSession = Depends(get_db)):
    try:
        if chat_data.request_id:
            context = await get_rag_context_for_request(db, request_id=chat_data.request_id)
        else:
            context = {"request": None}
        response_text = f"AI would analyze: {context}"
        return {"message_id": chat_data.id or 1, "response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {str(e)}")


@app.post("/api/telegram/create-request")
async def create_telegram_request_endpoint(telegram_data: TelegramRequestCreate, db: AsyncSession = Depends(get_db)):
    await create_telegram_request(db, **telegram_data.model_dump())
    return {"status": "success", "message": "Request created via Telegram"}


@app.get("/api/telegram/stats")
async def get_telegram_stats(days=7, db: AsyncSession = Depends(get_db)):
    return await get_telegram_stats(db, days=days)


@app.post("/api/bulk/update-status")
async def bulk_update_status_endpoint(bulk_data: BulkUpdateStatus, db: AsyncSession = Depends(get_db)):
    count, _ = await bulk_update_status(db, **bulk_data.model_dump())
    return {"status": "success", "updated_count": count}


@app.post("/api/bulk/assign-employees")
async def bulk_assign_employees_endpoint(bulk_data: BulkAssignEmployees, db: AsyncSession = Depends(get_db)):
    count, _ = await bulk_assign_employees(db, **bulk_data.model_dump())
    return {"status": "success", "assigned_count": count}
