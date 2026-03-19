from __future__ import annotations

from app.pipeline.models import ProcessedItem


class FilterAgent:
    PRODUCT_TYPES = {
        "new_product",
        "feature_update",
        "model_update",
        "api_sdk_update",
        "agent_workflow_upgrade",
        "enterprise_opening",
        "funding_product_related",
        "open_source_release",
    }

    def process(self, items: list[ProcessedItem]) -> list[ProcessedItem]:
        for item in items:
            item.is_product_signal = 1 if item.event_type in self.PRODUCT_TYPES else 0
            if not item.is_product_signal:
                item.signal_score = 0.2
                item.usefulness_score = 0.2
                item.keep_for_analysis = 0
                item.explain_score = ["不属于 AI 产品动态，已被过滤。"]
                continue

            score = 0.42
            score += 0.18 if item.is_first_party else 0.04
            score += item.silicon_valley_score * 0.12
            score += item.novelty_score * 0.18
            if item.evidence_type in {"official_release", "github_release", "changelog"}:
                score += 0.1
            if item.event_type in {"agent_workflow_upgrade", "api_sdk_update", "open_source_release"}:
                score += 0.08
            item.signal_score = round(min(score, 1.0), 2)
            item.usefulness_score = round(min(item.signal_score + 0.04, 1.0), 2)
            item.keep_for_analysis = 1 if item.usefulness_score >= 0.7 else 0
            item.explain_score = [
                "已确认为 AI 产品动态。",
                "一手源与 source tier 已进入评分。",
                "novelty_score 体现近 7 天同公司同产品信号的新颖度。",
            ]
        return items
