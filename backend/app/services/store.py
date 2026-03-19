from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.db import connect, ensure_database, row_to_dict
from app.pipeline.models import DashboardSnapshot, MergedEvent, ProcessedItem, RawItem, SourceRecord, TrendReport


class TrackerStore:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        ensure_database(db_path)

    def clear_all_data(self) -> None:
        with connect(self.db_path) as conn:
            for table in [
                "raw_items",
                "processed_items",
                "merged_events",
                "trend_reports",
                "job_runs",
                "sources",
                "event_sources",
                "source_health",
            ]:
                conn.execute(f"DELETE FROM {table}")
            conn.commit()

    def fetch_published_snapshot(self, mode: str = "live") -> DashboardSnapshot:
        target = self.db_path.parents[1] / "processed" / "dashboard_data.json"
        if target.exists():
            payload = json.loads(target.read_text(encoding="utf-8"))
            payload["mode"] = mode
            return DashboardSnapshot(**payload)
        return self.fetch_dashboard_snapshot(mode)

    def seed_demo_payload(self, payload: dict[str, Any]) -> None:
        self.clear_all_data()
        self.upsert_sources([SourceRecord(**source) for source in payload.get("sources", [])])
        self.upsert_source_health(payload.get("source_health", []))
        self.upsert_raw_items([RawItem(**item) for item in payload.get("raw_items", [])])

        processed = []
        for item in payload.get("processed_items", []):
            processed.append(
                ProcessedItem(
                    realtime_bucket=item.get("realtime_bucket", "12h"),
                    explain_score=item.get("explain_score", []),
                    **{key: value for key, value in item.items() if key not in {"realtime_bucket", "explain_score"}}
                )
            )
        self.upsert_processed_items(processed)

        merged = []
        for item in payload.get("merged_events", []):
            merged.append(
                MergedEvent(
                    trend_tags=item.get("trend_tags", []),
                    strongest_signal=item.get("strongest_signal", ""),
                    explain_merge=item.get("explain_merge", []),
                    **{key: value for key, value in item.items() if key not in {"trend_tags", "strongest_signal", "explain_merge"}}
                )
            )
        self.upsert_merged_events(merged)
        self.upsert_event_sources(payload.get("event_sources", []))
        self.upsert_trend_reports([TrendReport(**report) for report in payload.get("trend_reports", [])])

    def upsert_sources(self, rows: list[SourceRecord]) -> None:
        with connect(self.db_path) as conn:
            conn.executemany(
                """
                INSERT OR REPLACE INTO sources (
                  source_name, source_type, source_tier, region, frequency_minutes, enabled, last_success_at, last_error
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        row.source_name,
                        row.source_type,
                        row.source_tier,
                        row.region,
                        row.frequency_minutes,
                        row.enabled,
                        row.last_success_at,
                        row.last_error,
                    )
                    for row in rows
                ],
            )
            conn.commit()

    def upsert_source_health(self, rows: list[dict[str, Any]]) -> None:
        with connect(self.db_path) as conn:
            conn.executemany(
                """
                INSERT OR REPLACE INTO source_health (
                  source_name, last_success_at, last_item_count, success_rate_7d, avg_latency_ms, extractor_status
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        row["source_name"],
                        row["last_success_at"],
                        row["last_item_count"],
                        row["success_rate_7d"],
                        row["avg_latency_ms"],
                        row["extractor_status"],
                    )
                    for row in rows
                ],
            )
            conn.commit()

    def upsert_raw_items(self, rows: list[RawItem]) -> None:
        with connect(self.db_path) as conn:
            conn.executemany(
                """
                INSERT OR REPLACE INTO raw_items (
                  id, source_name, source_type, source_tier, source_item_key, title, url, raw_text,
                  published_at, author, collected_at, language, region
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        row.id,
                        row.source_name,
                        row.source_type,
                        row.source_tier,
                        row.source_item_key,
                        row.title,
                        row.url,
                        row.raw_text,
                        row.published_at,
                        row.author,
                        row.collected_at,
                        row.language,
                        row.region,
                    )
                    for row in rows
                ],
            )
            conn.commit()

    def upsert_processed_items(self, rows: list[ProcessedItem]) -> None:
        with connect(self.db_path) as conn:
            conn.executemany(
                """
                INSERT OR REPLACE INTO processed_items (
                  item_id, company, product, event_type, summary_cn, keywords, is_first_party, signal_score,
                  usefulness_score, silicon_valley_score, novelty_score, evidence_type, is_product_signal,
                  keep_for_analysis, dedupe_group_id, realtime_bucket, explain_score
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        row.item_id,
                        row.company,
                        row.product,
                        row.event_type,
                        row.summary_cn,
                        json.dumps(row.keywords, ensure_ascii=False),
                        row.is_first_party,
                        row.signal_score,
                        row.usefulness_score,
                        row.silicon_valley_score,
                        row.novelty_score,
                        row.evidence_type,
                        row.is_product_signal,
                        row.keep_for_analysis,
                        row.dedupe_group_id,
                        row.realtime_bucket,
                        json.dumps(row.explain_score, ensure_ascii=False),
                    )
                    for row in rows
                ],
            )
            conn.commit()

    def upsert_merged_events(self, rows: list[MergedEvent]) -> None:
        with connect(self.db_path) as conn:
            conn.executemany(
                """
                INSERT OR REPLACE INTO merged_events (
                  merged_event_id, canonical_title, company, product, event_date, core_change, sources_count,
                  primary_source_url, confidence, merge_type, primary_source_tier, trend_tags, strongest_signal, explain_merge
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        row.merged_event_id,
                        row.canonical_title,
                        row.company,
                        row.product,
                        row.event_date,
                        row.core_change,
                        row.sources_count,
                        row.primary_source_url,
                        row.confidence,
                        row.merge_type,
                        row.primary_source_tier,
                        json.dumps(row.trend_tags, ensure_ascii=False),
                        row.strongest_signal,
                        json.dumps(row.explain_merge, ensure_ascii=False),
                    )
                    for row in rows
                ],
            )
            conn.commit()

    def upsert_event_sources(self, rows: list[dict[str, Any]]) -> None:
        with connect(self.db_path) as conn:
            conn.executemany(
                """
                INSERT OR REPLACE INTO event_sources (merged_event_id, raw_item_id, source_role)
                VALUES (?, ?, ?)
                """,
                [(row["merged_event_id"], row["raw_item_id"], row["source_role"]) for row in rows],
            )
            conn.commit()

    def upsert_trend_reports(self, rows: list[TrendReport]) -> None:
        with connect(self.db_path) as conn:
            conn.executemany(
                """
                INSERT OR REPLACE INTO trend_reports (
                  report_id, period_type, start_date, end_date, top_themes, key_companies, analysis_text, snapshot_json, generated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        row.report_id,
                        row.period_type,
                        row.start_date,
                        row.end_date,
                        json.dumps(row.top_themes, ensure_ascii=False),
                        json.dumps(row.key_companies, ensure_ascii=False),
                        row.analysis_text,
                        json.dumps(row.snapshot_json, ensure_ascii=False),
                        row.generated_at,
                    )
                    for row in rows
                ],
            )
            conn.commit()

    def insert_job_run(self, entry: dict[str, Any]) -> None:
        with connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO job_runs (run_id, job_name, stage, started_at, finished_at, status, message)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    entry["run_id"],
                    entry["job_name"],
                    entry["stage"],
                    entry["started_at"],
                    entry["finished_at"],
                    entry["status"],
                    entry["message"],
                ),
            )
            conn.commit()

    def fetch_dashboard_snapshot(self, mode: str = "demo") -> DashboardSnapshot:
        with connect(self.db_path) as conn:
            events = [
                {
                    **row_to_dict(row),
                    "supporting_sources": self.fetch_event_sources(row["merged_event_id"]),
                    "processed_items": self.fetch_processed_for_event(row["merged_event_id"]),
                }
                for row in conn.execute(
                    "SELECT * FROM merged_events ORDER BY event_date DESC, confidence DESC"
                ).fetchall()
            ]
            trend = conn.execute(
                "SELECT * FROM trend_reports ORDER BY generated_at DESC LIMIT 1"
            ).fetchone()
            latest_job = [
                row_to_dict(row)
                for row in conn.execute(
                    "SELECT * FROM job_runs ORDER BY id DESC LIMIT 10"
                ).fetchall()
            ]
            sources = [row_to_dict(row) for row in conn.execute("SELECT * FROM sources ORDER BY source_tier, source_name").fetchall()]
            health = {row["source_name"]: row_to_dict(row) for row in conn.execute("SELECT * FROM source_health").fetchall()}

        trend_dict = row_to_dict(trend) if trend else {
            "analysis_text": "趋势分析正在生成中，系统会基于最新抓取结果自动更新。",
            "snapshot_json": {},
            "generated_at": "",
        }
        metrics = self.fetch_metrics()
        overview = trend_dict["analysis_text"].splitlines()[0].strip()
        reports = self.fetch_reports()
        return DashboardSnapshot(
            generated_at=trend_dict.get("generated_at", ""),
            mode=mode,
            metrics=metrics,
            overview=overview,
            strongest_trend=trend_dict.get("snapshot_json", {}).get("strongest_trend", ""),
            weakest_evidence_trend=trend_dict.get("snapshot_json", {}).get("weakest_evidence_trend", ""),
            trend_snapshot=trend_dict.get("snapshot_json", {}),
            events=events,
            observation_cards=reports["observation_cards"],
            sources=[{**source, "health": health.get(source["source_name"], {})} for source in sources],
            reports=reports,
            job_status=latest_job,
        )

    def fetch_event_sources(self, event_id: str) -> list[dict[str, Any]]:
        with connect(self.db_path) as conn:
            return [
                row_to_dict(row)
                for row in conn.execute(
                    "SELECT * FROM event_sources WHERE merged_event_id = ? ORDER BY source_role DESC",
                    (event_id,),
                ).fetchall()
            ]

    def fetch_processed_for_event(self, event_id: str) -> list[dict[str, Any]]:
        with connect(self.db_path) as conn:
            rows = conn.execute(
                """
                SELECT processed_items.* FROM processed_items
                JOIN event_sources ON event_sources.raw_item_id = processed_items.item_id
                WHERE event_sources.merged_event_id = ?
                """,
                (event_id,),
            ).fetchall()
            return [row_to_dict(row) for row in rows]

    def fetch_reports(self) -> dict[str, Any]:
        executive_path = self.db_path.parents[1] / "reports" / "executive_summary.json"
        daily_path = self.db_path.parents[1] / "reports" / "daily_report.md"
        weekly_path = self.db_path.parents[1] / "reports" / "weekly_report.md"
        observation_cards: list[str] = []
        if executive_path.exists():
            data = json.loads(executive_path.read_text(encoding="utf-8"))
            observation_cards = data.get("observation_cards", [])
        return {
            "daily_markdown": daily_path.read_text(encoding="utf-8") if daily_path.exists() else "",
            "weekly_markdown": weekly_path.read_text(encoding="utf-8") if weekly_path.exists() else "",
            "executive_summary": json.loads(executive_path.read_text(encoding="utf-8")) if executive_path.exists() else {},
            "observation_cards": observation_cards,
        }

    def fetch_metrics(self) -> dict[str, Any]:
        with connect(self.db_path) as conn:
            total_events = conn.execute("SELECT COUNT(*) FROM merged_events").fetchone()[0]
            first_party = conn.execute("SELECT COUNT(*) FROM processed_items WHERE is_first_party = 1").fetchone()[0]
            overseas = conn.execute("SELECT COUNT(*) FROM raw_items WHERE region = 'global'").fetchone()[0]
            high_priority = conn.execute("SELECT COUNT(*) FROM processed_items WHERE signal_score >= 0.85").fetchone()[0]
            total_processed = max(conn.execute("SELECT COUNT(*) FROM processed_items").fetchone()[0], 1)
            last_job = conn.execute("SELECT finished_at FROM job_runs ORDER BY id DESC LIMIT 1").fetchone()
            success_count = conn.execute("SELECT COUNT(*) FROM job_runs WHERE status = 'success'").fetchone()[0]
            total_jobs = max(conn.execute("SELECT COUNT(*) FROM job_runs").fetchone()[0], 1)
        return {
            "total_events": total_events,
            "new_events_24h": total_events,
            "first_party_ratio": round(first_party / total_processed, 2),
            "overseas_ratio": round(overseas / max(total_processed, 1), 2),
            "high_priority_events": high_priority,
            "last_success_at": last_job[0] if last_job else "",
            "job_success_rate": round(success_count / total_jobs, 2),
        }
