from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    project_root: Path
    data_dir: Path
    seed_path: Path
    sources_path: Path
    sqlite_path: Path
    timezone: str
    default_mode: str
    openai_api_key: str | None
    openai_model: str


def get_settings() -> Settings:
    project_root = Path(__file__).resolve().parents[3]
    data_dir = project_root / "data"
    sqlite_path = data_dir / "processed" / "ai_pulse_tracker.db"
    return Settings(
        project_root=project_root,
        data_dir=data_dir,
        seed_path=data_dir / "seed" / "demo_payload.json",
        sources_path=project_root / "config" / "sources.json",
        sqlite_path=sqlite_path,
        timezone=os.getenv("APP_TIMEZONE", "Asia/Shanghai"),
        default_mode=os.getenv("APP_MODE", "live"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    )
