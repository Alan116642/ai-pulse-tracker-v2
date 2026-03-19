from __future__ import annotations

from collections import defaultdict
from difflib import SequenceMatcher

from app.pipeline.models import MergedEvent, ProcessedItem, RawItem


class MergeAgent:
    def process(self, raw_items: list[RawItem], processed_items: list[ProcessedItem]) -> tuple[list[MergedEvent], list[dict[str, str]]]:
        raw_lookup = {item.id: item for item in raw_items}
        groups: dict[str, list[tuple[RawItem, ProcessedItem]]] = defaultdict(list)
        for item in processed_items:
            if item.keep_for_analysis:
                groups[item.dedupe_group_id].append((raw_lookup[item.item_id], item))

        merged_events: list[MergedEvent] = []
        event_sources: list[dict[str, str]] = []
        for index, rows in enumerate(groups.values(), start=1):
            primary_raw, primary_processed = self._pick_primary(rows)
            merge_type = "same_event"
            if len(rows) > 1 and any(self._is_update(primary_processed, row[1]) for row in rows[1:]):
                merge_type = "event_update"
            merged_event_id = f"evt-{index:03d}"
            merged_events.append(
                MergedEvent(
                    merged_event_id=merged_event_id,
                    canonical_title=primary_raw.title,
                    company=primary_processed.company,
                    product=primary_processed.product,
                    event_date=primary_raw.published_at,
                    core_change=primary_processed.summary_cn,
                    sources_count=len(rows),
                    primary_source_url=primary_raw.url,
                    confidence=round(min(0.74 + len(rows) * 0.08 + primary_processed.signal_score * 0.1, 0.99), 2),
                    merge_type=merge_type,
                    primary_source_tier=primary_raw.source_tier,
                    trend_tags=self._trend_tags(primary_processed),
                    strongest_signal=primary_processed.summary_cn,
                    explain_merge=[
                        "同公司、同产品、同能力方向的内容会优先归并。",
                        "主源按官方博客 > docs/changelog > GitHub release > 官方账号 > 社区 > 媒体选择。",
                        "event_update 表示同一能力演进链路中的后续补充更新。",
                    ],
                )
            )
            event_sources.append({"merged_event_id": merged_event_id, "raw_item_id": primary_raw.id, "source_role": "primary"})
            for candidate_raw, candidate_processed in rows[1:]:
                role = "supporting"
                if self._is_duplicate(primary_raw, candidate_raw):
                    role = "duplicate"
                elif self._is_update(primary_processed, candidate_processed):
                    role = "event_update"
                event_sources.append({"merged_event_id": merged_event_id, "raw_item_id": candidate_raw.id, "source_role": role})
        return merged_events, event_sources

    def _pick_primary(self, rows: list[tuple[RawItem, ProcessedItem]]) -> tuple[RawItem, ProcessedItem]:
        priority = {"T0": 0, "T1": 1, "T2": 2, "T3": 3, "T4": 4}
        rows.sort(key=lambda row: (priority.get(row[0].source_tier, 9), -row[1].signal_score))
        return rows[0]

    def _is_duplicate(self, primary: RawItem, candidate: RawItem) -> bool:
        return primary.url == candidate.url or SequenceMatcher(None, primary.title.lower(), candidate.title.lower()).ratio() > 0.92

    def _is_update(self, primary: ProcessedItem, candidate: ProcessedItem) -> bool:
        return primary.company == candidate.company and primary.product == candidate.product and (
            primary.event_type != candidate.event_type or candidate.novelty_score > 0.75
        )

    def _trend_tags(self, item: ProcessedItem) -> list[str]:
        mapping = {
            "agent_workflow_upgrade": ["agent", "developer_tooling"],
            "api_sdk_update": ["developer_tooling", "enterprise"],
            "enterprise_opening": ["enterprise"],
            "feature_update": ["multimodal"],
            "open_source_release": ["open_source"],
        }
        return mapping.get(item.event_type, ["enterprise"])
