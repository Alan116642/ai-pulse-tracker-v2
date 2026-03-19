from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import build_router
from app.core.config import get_settings
from app.pipeline.agents.orchestrator import OrchestratorAgent
from app.services.openai_client import OpenAIClient
from app.services.scheduler import build_scheduler
from app.services.store import TrackerStore

settings = get_settings()
store = TrackerStore(settings.sqlite_path)
llm = OpenAIClient(settings)
orchestrator = OrchestratorAgent(settings.project_root, settings.sources_path, settings.seed_path, store, llm)
scheduler = build_scheduler(orchestrator)
state = {"mode": settings.default_mode}


@asynccontextmanager
async def lifespan(app: FastAPI):
    orchestrator.run(mode=state["mode"], job_name="bootstrap")
    if not scheduler.running:
        scheduler.start()
    yield
    if scheduler.running:
        scheduler.shutdown(wait=False)


app = FastAPI(title="AI Pulse Tracker v2", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(build_router(store, orchestrator, lambda: state["mode"], lambda mode: state.__setitem__("mode", mode)))


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "AI Pulse Tracker v2", "mode": state["mode"], "status": "running"}
