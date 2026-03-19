from __future__ import annotations

from fastapi import APIRouter

from app.pipeline.agents.orchestrator import OrchestratorAgent
from app.schemas import DashboardResponse, HealthResponse, RunRequest
from app.services.store import TrackerStore


def build_router(store: TrackerStore, orchestrator: OrchestratorAgent, mode_getter, mode_setter) -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.get("/dashboard/overview", response_model=DashboardResponse)
    def dashboard() -> DashboardResponse:
        return DashboardResponse(**store.fetch_published_snapshot(mode_getter()).to_dict())

    @router.get("/events")
    def events() -> list[dict]:
        return store.fetch_published_snapshot(mode_getter()).events

    @router.get("/events/{event_id}")
    def event_detail(event_id: str) -> dict:
        events_data = store.fetch_published_snapshot(mode_getter()).events
        return next((event for event in events_data if event["merged_event_id"] == event_id), {})

    @router.get("/events/{event_id}/sources")
    def event_sources(event_id: str) -> list[dict]:
        events_data = store.fetch_published_snapshot(mode_getter()).events
        event = next((item for item in events_data if item["merged_event_id"] == event_id), None)
        return event.get("supporting_sources", []) if event else []

    @router.get("/reports/daily")
    def daily() -> dict:
        return {"markdown": store.fetch_reports()["daily_markdown"]}

    @router.get("/reports/weekly")
    def weekly() -> dict:
        return {"markdown": store.fetch_reports()["weekly_markdown"]}

    @router.get("/jobs/status")
    def jobs_status() -> list[dict]:
        return store.fetch_published_snapshot(mode_getter()).job_status

    @router.get("/sources")
    def sources() -> list[dict]:
        return store.fetch_published_snapshot(mode_getter()).sources

    @router.get("/metrics")
    def metrics() -> dict:
        return store.fetch_published_snapshot(mode_getter()).metrics

    @router.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(status="ok", database="ok", scheduler="configured", mode=mode_getter())

    @router.post("/jobs/run-now")
    def run_now(request: RunRequest) -> dict:
        mode_setter(request.mode)
        snapshot = orchestrator.run(mode=request.mode, job_name="run_now")
        return {"status": "ok", "mode": request.mode, "generated_at": snapshot.generated_at}

    @router.get("/mode")
    def current_mode() -> dict:
        return {"mode": mode_getter()}

    return router
