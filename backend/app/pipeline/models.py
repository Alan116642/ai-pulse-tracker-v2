from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class SourceRecord:
    source_name: str
    source_type: str
    source_tier: str
    region: str
    frequency_minutes: int
    enabled: int
    last_success_at: str = ""
    last_error: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class RawItem:
    id: str
    source_name: str
    source_type: str
    source_tier: str
    source_item_key: str
    title: str
    url: str
    raw_text: str
    published_at: str
    author: str
    collected_at: str
    language: str
    region: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ProcessedItem:
    item_id: str
    company: str
    product: str
    event_type: str
    summary_cn: str
    keywords: list[str]
    is_first_party: int
    signal_score: float
    usefulness_score: float
    silicon_valley_score: float
    novelty_score: float
    evidence_type: str
    is_product_signal: int
    keep_for_analysis: int
    dedupe_group_id: str
    realtime_bucket: str = "12h"
    explain_score: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class MergedEvent:
    merged_event_id: str
    canonical_title: str
    company: str
    product: str
    event_date: str
    core_change: str
    sources_count: int
    primary_source_url: str
    confidence: float
    merge_type: str
    primary_source_tier: str
    trend_tags: list[str] = field(default_factory=list)
    strongest_signal: str = ""
    explain_merge: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class TrendReport:
    report_id: str
    period_type: str
    start_date: str
    end_date: str
    top_themes: list[str]
    key_companies: list[str]
    analysis_text: str
    snapshot_json: dict[str, Any]
    generated_at: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class DashboardSnapshot:
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

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
