from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from dotenv import load_dotenv
load_dotenv()

from routers import auth, chatrooms, private_chats, messages, media, reactions, stickers, ai
from tasks.expiry_watcher import expiry_watcher
from tasks.auto_reset_scheduler import auto_reset_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background tasks
    asyncio.create_task(expiry_watcher())
    asyncio.create_task(auto_reset_scheduler())
    yield

app = FastAPI(title="ChatIQ API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chatiq-vs.vercel.app"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(chatrooms.router, prefix="/api", tags=["Chatrooms"])
app.include_router(private_chats.router, prefix="/api", tags=["Private Chats"])
app.include_router(messages.router, prefix="/api", tags=["Messages"])
app.include_router(media.router, prefix="/api", tags=["Media"])
app.include_router(reactions.router, prefix="/api", tags=["Reactions"])
app.include_router(stickers.router, prefix="/api", tags=["Stickers"])
app.include_router(ai.router, prefix="/api", tags=["AI"])

@app.get("/")
def root():
    return {"message": "ChatIQ API is running", "docs": "/docs"}
