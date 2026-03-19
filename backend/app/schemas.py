from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class DashboardResponse(BaseModel):
    generated_at: str
    mode: str
    metrics: dict[str, Any]
    overview: str
    strongest_trend: str
    weakest_evidence_trend: str
    trend_snapshot: dict[str, Any]
    events: list[dict[str, Any]]
    observation_cards: list[str]
    sources: list[dict[str, Any]]
    reports: dict[str, Any]
    job_status: list[dict[str, Any]]


class HealthResponse(BaseModel):
    status: str
    database: str
    scheduler: str
    mode: str


class RunRequest(BaseModel):
    mode: str = "demo"
