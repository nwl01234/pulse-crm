# Pulse CRM

![Pulse CRM](.assets/banner.svg)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white)
![Alembic](https://img.shields.io/badge/Alembic-migrations-50C878)
![aiogram](https://img.shields.io/badge/aiogram-3.x-2CA5E0)

Полноценный клиент-серверный CRM: SPA на React 18 + TypeScript (Vite, Tailwind) и асинхронный backend на FastAPI + SQLAlchemy 2.0 с миграциями Alembic. Заявки, задачи, статистика дашборда, AI-сводки, Telegram-интеграция и массовые операции (bulk) для менеджеров.

## Возможности

- **Заявки (requests)** — CRUD, статусы, фильтрация, история (ActionLog)
- **Задачи по заявкам** — назначение сотрудников, массовые операции: `bulk_update_status`, `bulk_assign_employees`
- **Дашборд** — статистика (`DashboardStats`), AI-сводки (`generate_ai_summary`)
- **Telegram** — приём заявок через бота, обновление статусов (`telegram_bot.py`), статистика канала
- **Авторизация** — JWT с refresh-токенами (`LoginRequest`, `RefreshTokenRequest`)
- **RAG-контекст** — подбор релевантного контекста для AI по заявке (`get_rag_context_for_request`)
- **UI-кит на React** — собственные компоненты: `Modal`, `Button`, `badges`, `Avatar`, `EmptyState`, `FormControls`, `PageHeader`, `Icon`

## Архитектура

```mermaid
flowchart TB
    subgraph Frontend["React 18 + TypeScript (Vite)"]
        SPA[components / store / types / utils]
    end
    subgraph Backend["FastAPI (async)"]
        API[app/main.py + auth + crud]
        BOT[app/telegram_bot.py · aiogram 3]
        MIG[Alembic migrations]
    end
    SPA -- "HTTP / JWT" --> API
    BOT --> API
    API --> DB[(SQLAlchemy 2.0 async)]
    MIG --> DB
    API --> LLM[AI-сводки / RAG]
```

## Быстрый старт

**Backend:**

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload     # http://localhost:8000
```

**Frontend:**

```bash
npm install
npm run dev                       # http://localhost:5173
npm run build                     # tsc && vite build
```

## Стек

| Слой | Технологии |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3, react-router-dom 6 |
| Backend | FastAPI, SQLAlchemy 2.0 (asyncio), Alembic, pydantic v2 |
| Auth | JWT + refresh-токены, passlib/bcrypt |
| Telegram | aiogram 3.x |
| Quality | pytest, black, isort, mypy (в dev-зависимостях) |

## Скриншоты

| | |
|---|---|
| ![Дашборд](.assets/screens/01.png) | ![Заявки](.assets/screens/02.png) |
| ![Статистика](.assets/screens/03.png) | ![AI-сводки](.assets/screens/04.png) |
| ![Telegram](.assets/screens/05.png) | ![Карточка заявки](.assets/screens/06.png) |

---
Часть портфолио: [mini-crm](https://github.com/nwl01234/mini-crm) → [orbit-crm](https://github.com/nwl01234/orbit-crm) → **pulse-crm** · [business-flow-automator](https://github.com/nwl01234/business-flow-automator)
