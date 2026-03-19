from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import shutil
from uuid import uuid4

from app.pipeline.agents.collector import CollectorAgent
from app.pipeline.agents.enhancer import SignalEnhancerAgent
from app.pipeline.agents.filter import FilterAgent
from app.pipeline.agents.merger import MergeAgent
from app.pipeline.agents.presenter import PresentationAgent
from app.pipeline.agents.trend import TrendAgent
from app.pipeline.models import DashboardSnapshot
from app.services.demo_seed import load_demo_payload
from app.services.openai_client import OpenAIClient
from app.services.store import TrackerStore


class OrchestratorAgent:
    def __init__(self, project_root: Path, sources_path: Path, seed_path: Path, store: TrackerStore, llm: OpenAIClient) -> None:
        self.collector = CollectorAgent(project_root, sources_path, seed_path)
        self.enhancer = SignalEnhancerAgent()
        self.filterer = FilterAgent()
        self.merger = MergeAgent()
        self.trend = TrendAgent(llm)
        self.presenter = PresentationAgent(project_root)
        self.project_root = project_root
        self.seed_path = seed_path
        self.store = store

    def run(self, mode: str = "demo", job_name: str = "manual") -> DashboardSnapshot:
        run_id = str(uuid4())
        started = datetime.now(timezone.utc).isoformat()
        backup_path = self.store.db_path.with_suffix(".bak")
        if self.store.db_path.exists():
            shutil.copyfile(self.store.db_path, backup_path)
        self.store.clear_all_data()

        sources, raw_items, health_rows = self.collector.collect(mode)
        self.store.upsert_sources(sources)
        self.store.upsert_source_health(health_rows)
        self.store.upsert_raw_items(raw_items)
        self._log(run_id, job_name, "collect", started, "success", f"items={len(raw_items)}")

        processed = self.enhancer.process(raw_items)
        self.store.upsert_processed_items(processed)
        self._log(run_id, job_name, "enrich", started, "success", f"items={len(processed)}")

        filtered = self.filterer.process(processed)
        self.store.upsert_processed_items(filtered)
        self._log(run_id, job_name, "filter", started, "success", f"retained={len([item for item in filtered if item.keep_for_analysis])}")

        merged_events, event_sources = self.merger.process(raw_items, filtered)
        self.store.upsert_merged_events(merged_events)
        self.store.upsert_event_sources(event_sources)
        self._log(run_id, job_name, "merge", started, "success", f"events={len(merged_events)}")

        trend_report = self.trend.analyze(merged_events)
        self.store.upsert_trend_reports([trend_report])
        self._log(run_id, job_name, "analyze", started, "success", trend_report.report_id)

        snapshot = self.store.fetch_dashboard_snapshot(mode)
        if mode == "live" and self._should_restore_live_snapshot(snapshot, health_rows):
            if backup_path.exists():
                shutil.copyfile(backup_path, self.store.db_path)
                restored = self.store.fetch_dashboard_snapshot(mode)
                self.presenter.publish(restored)
                self._log(run_id, job_name, "restore", started, "success", "reused previous live snapshot")
                return restored

        snapshot.observation_cards = self.presenter.build_observation_cards(merged_events, trend_report)
        self.presenter.publish(snapshot)
        self._log(run_id, job_name, "present", started, "success", "dashboard published")
        self._log(run_id, job_name, "refresh", started, "success", "frontend payload refreshed")
        return snapshot

    def _should_restore_live_snapshot(self, snapshot: DashboardSnapshot, health_rows: list[dict[str, object]]) -> bool:
        healthy_sources = len([row for row in health_rows if str(row.get("extractor_status", "")).startswith("healthy")])
        total_events = snapshot.metrics.get("total_events", 0)
        high_priority = snapshot.metrics.get("high_priority_events", 0)
        if healthy_sources < 2:
            return True
        if total_events < 3:
            return True
        if high_priority < 1:
            return True
        return False

    def _log(self, run_id: str, job_name: str, stage: str, started_at: str, status: str, message: str) -> None:
        self.store.insert_job_run(
            {
                "run_id": run_id,
                "job_name": job_name,
                "stage": stage,
                "started_at": started_at,
                "finished_at": datetime.now(timezone.utc).isoformat(),
                "status": status,
                "message": message,
            }
        )
