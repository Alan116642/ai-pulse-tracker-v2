from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import get_settings
from app.pipeline.agents.orchestrator import OrchestratorAgent
from app.services.openai_client import OpenAIClient
from app.services.store import TrackerStore


def main() -> None:
    parser = argparse.ArgumentParser(description="Run AI Pulse Tracker v2 pipeline")
    parser.add_argument("--mode", choices=["demo", "live"], default="demo")
    parser.add_argument("--job-name", default="manual")
    args = parser.parse_args()

    settings = get_settings()
    store = TrackerStore(settings.sqlite_path)
    orchestrator = OrchestratorAgent(settings.project_root, settings.sources_path, settings.seed_path, store, OpenAIClient(settings))
    snapshot = orchestrator.run(mode=args.mode, job_name=args.job_name)
    print(json.dumps(snapshot.to_dict(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
