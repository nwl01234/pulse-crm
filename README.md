# Pulse CRM — корпоративная CRM с AI-ассистентом

Внутренняя CRM для сервисной компании: заявки, исполнители, статусы, задачи, dashboard, аудит-лог и AI-модуль (авто-резюме заявки, RAG-контекст из истории, Telegram-приём заявок).

## Стек
- **Backend:** Python 3.11, FastAPI (async), SQLAlchemy 2.0 async, Alembic, JWT (access+refresh), bcrypt
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Интеграции:** Telegram-бот (aiogram 3) — заявки и смена статусов прямо из чата
- **AI:** OpenAI-совместимый API (работает и с локальной Ollama), RAG-подбор контекста по заявке

## Ключевые фичи
- Заявки → задачи → исполнители, массовые операции (bulk assign / bulk status)
- Ролевой доступ: админ / сотрудник, refresh-токены, аудит всех действий
- Dashboard со статистикой: нагрузка исполнителей, конверсия статусов
- AI-резюме длинных заявок и подсказка исполнителю на основе истории похожих заявок
- Полный REST API, OpenAPI/Swagger из коробки (`/docs`)

## Запуск
```bash
cp .env.example .env   # SECRET_KEY, TELEGRAM_TOKEN, AI_API_KEY (опционально)
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload        # backend :8000

npm install && npm run dev           # frontend :5173
```

## Архитектура
```
app/          FastAPI: routers → crud → models (async SQLAlchemy)
src/          React+TS SPA (components, store, types)
alembic/      миграции схемы
```

> Демо-данные и доступы не публикуются по соображениям безопасности — .env.example содержит список всех переменных.
