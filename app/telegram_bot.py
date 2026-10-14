from aiogram import Bot, Dispatcher, types, F
from aiogram.filters.state import State
from aiogram.fsm_storage.memory import MemoryStorage
import asyncio

bot = Bot(token="YOUR_TELEGRAM_BOT_TOKEN")
dp = Dispatcher(storage=MemoryStorage())


class RequestState(State):
    title = "title"
    description = "description"


@dp.message.command("start")
async def cmd_start(message: types.Message):
    await message.answer("Welcome! I can help you create requests and manage your CRM.")
    await message.reply_text("/create - Create a new request\n/stats - View statistics")


@dp.message.command("create")
async def cmd_create(message: types.Message):
    state = RequestState()
    state.set(message.user.id)
    await dp.start_fsm(state, "title")
    await message.answer("Please enter the request title:")


@dp.message.filter(state=RequestState.title())
async def cmd_create_title(message: types.Message):
    state = RequestState.get(message.user.id)
    if state and state.has_state('title'):
        await dp.finish_fsm(state, 'description')
        await message.answer("Title received. Please enter the description (or /skip to skip):")


@dp.message.filter(state=RequestState.description())
async def cmd_create_description(message: types.Message):
    state = RequestState.get(message.user.id)
    if state and state.has_state('description'):
        await dp.finish_fsm(state, 'title')
        await message.answer("Request created!")


@dp.message.command("/skip", state=RequestState.description())
async def cmd_skip(message: types.Message):
    state = RequestState.get(message.user.id)
    if state and state.has_state('title'):
        await dp.finish_fsm(state, 'description')
        await message.answer("Creating request without description...")


@dp.message.command("/stats")
async def cmd_stats(message: types.Message):
    await message.answer("📊 Statistics:")
    await message.reply_text("Total requests: 5\nNew this week: 2\nIn progress: 3\nDone recently: 1")


if __name__ == "__main__":
    print("Telegram Bot started!")
    dp.run_polling(bot)
