from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS raw_items (
  id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_tier TEXT NOT NULL,
  source_item_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  published_at TEXT NOT NULL,
  author TEXT NOT NULL,
  collected_at TEXT NOT NULL,
  language TEXT NOT NULL,
  region TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS processed_items (
  item_id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  product TEXT NOT NULL,
  event_type TEXT NOT NULL,
  summary_cn TEXT NOT NULL,
  keywords TEXT NOT NULL,
  is_first_party INTEGER NOT NULL,
  signal_score REAL NOT NULL,
  usefulness_score REAL NOT NULL,
  silicon_valley_score REAL NOT NULL,
  novelty_score REAL NOT NULL,
  evidence_type TEXT NOT NULL,
  is_product_signal INTEGER NOT NULL,
  keep_for_analysis INTEGER NOT NULL,
  dedupe_group_id TEXT NOT NULL,
  realtime_bucket TEXT NOT NULL,
  explain_score TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS merged_events (
  merged_event_id TEXT PRIMARY KEY,
  canonical_title TEXT NOT NULL,
  company TEXT NOT NULL,
  product TEXT NOT NULL,
  event_date TEXT NOT NULL,
  core_change TEXT NOT NULL,
  sources_count INTEGER NOT NULL,
  primary_source_url TEXT NOT NULL,
  confidence REAL NOT NULL,
  merge_type TEXT NOT NULL,
  primary_source_tier TEXT NOT NULL,
  trend_tags TEXT NOT NULL,
  strongest_signal TEXT NOT NULL,
  explain_merge TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trend_reports (
  report_id TEXT PRIMARY KEY,
  period_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  top_themes TEXT NOT NULL,
  key_companies TEXT NOT NULL,
  analysis_text TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  generated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  job_name TEXT NOT NULL,
  stage TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
  source_name TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_tier TEXT NOT NULL,
  region TEXT NOT NULL,
  frequency_minutes INTEGER NOT NULL,
  enabled INTEGER NOT NULL,
  last_success_at TEXT NOT NULL,
  last_error TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_sources (
  merged_event_id TEXT NOT NULL,
  raw_item_id TEXT NOT NULL,
  source_role TEXT NOT NULL,
  PRIMARY KEY (merged_event_id, raw_item_id)
);

CREATE TABLE IF NOT EXISTS source_health (
  source_name TEXT PRIMARY KEY,
  last_success_at TEXT NOT NULL,
  last_item_count INTEGER NOT NULL,
  success_rate_7d REAL NOT NULL,
  avg_latency_ms REAL NOT NULL,
  extractor_status TEXT NOT NULL
);
"""


def ensure_database(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as connection:
        connection.executescript(SCHEMA_SQL)
        connection.commit()


def connect(db_path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    data = dict(row)
    for key, value in list(data.items()):
        if key in {"keywords", "top_themes", "key_companies", "snapshot_json", "trend_tags", "explain_merge", "explain_score"}:
            try:
                data[key] = json.loads(value)
            except (TypeError, json.JSONDecodeError):
                data[key] = value
    return data
