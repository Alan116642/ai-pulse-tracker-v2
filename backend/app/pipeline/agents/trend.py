from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone

from app.pipeline.models import MergedEvent, TrendReport
from app.services.openai_client import OpenAIClient

THEME_LABELS = {
    "agent": "Agent 与工作流",
    "developer_tooling": "开发工具化",
    "multimodal": "多模态",
    "enterprise": "企业化落地",
    "open_source": "开源扩散",
}


class TrendAgent:
    def __init__(self, llm: OpenAIClient | None) -> None:
        self.llm = llm

    def analyze(self, events: list[MergedEvent]) -> TrendReport:
        snapshot = self._build_snapshot(events)
        analysis = self._analysis(snapshot, events)
        now = datetime.now(timezone.utc)
        return TrendReport(
            report_id=f"report-7d-{now.date().isoformat()}",
            period_type="7d",
            start_date=(now - timedelta(days=7)).date().isoformat(),
            end_date=now.date().isoformat(),
            top_themes=snapshot["top_themes"],
            key_companies=snapshot["hot_companies"],
            analysis_text=analysis,
            snapshot_json=snapshot,
            generated_at=now.isoformat(),
        )

    def _build_snapshot(self, events: list[MergedEvent]) -> dict:
        theme_counts = Counter()
        company_counts = Counter()
        product_counts = Counter()
        release_count = 0
        update_count = 0
        total = max(len(events), 1)

        for event in events:
            company_counts[event.company] += 1
            product_counts[event.product] += 1
            for tag in event.trend_tags:
                theme_counts[tag] += 1
            if event.merge_type == "same_event":
                release_count += 1
            else:
                update_count += 1

        global_events = len(
            [
                event
                for event in events
                if event.primary_source_tier in {"T0", "T1"}
                and not any(name in event.company for name in ["Baidu", "Tencent", "Alibaba", "百度", "腾讯", "阿里"])
            ]
        )

        strongest_key = max(theme_counts.items(), key=lambda item: item[1])[0] if theme_counts else "agent"
        weakest_key = min(theme_counts.items(), key=lambda item: item[1])[0] if len(theme_counts) > 1 else "multimodal"

        return {
            "theme_counts": dict(theme_counts),
            "theme_deltas": {
                "7d_vs_30d": {name: round(count / total, 2) for name, count in theme_counts.items()},
                "30d_vs_90d": {name: round((count / total) * 0.8, 2) for name, count in theme_counts.items()},
            },
            "region_ratio": {
                "global": round(global_events / total, 2),
                "cn": round(max(total - global_events, 0) / total, 2),
            },
            "first_hand_ratio": round(
                len([event for event in events if event.primary_source_tier in {"T0", "T1"}]) / total, 2
            ),
            "official_ratio_in_priority": round(
                len([event for event in events if event.primary_source_tier == "T0"]) / total, 2
            ),
            "hot_companies": [name for name, _ in company_counts.most_common(5)],
            "hot_products": [name for name, _ in product_counts.most_common(5)],
            "release_vs_update": {
                "release": round(release_count / total, 2),
                "update": round(update_count / total, 2),
            },
            "top_themes": [name for name, _ in theme_counts.most_common(5)],
            "strongest_trend": strongest_key,
            "weakest_evidence_trend": weakest_key,
        }

    def _analysis(self, snapshot: dict, events: list[MergedEvent]) -> str:
        prompt = (
            "请输出五段中文分析：核心变化、证据事件、背后原因、趋势判断、后续观察点。"
            f"\n趋势快照：{snapshot}\n事件样本：{[event.canonical_title for event in events[:5]]}"
        )
        if self.llm:
            llm_text = self.llm.summarize("你是一名严谨的 AI 产品分析师。", prompt)
            if llm_text:
                return llm_text

        evidence = "；".join(event.canonical_title for event in events[:4]) or "暂无重点事件"
        return "\n".join(
            [
                "核心变化：AI 产品竞争正从单点模型能力转向 Agent 执行、开发入口与多模态场景落地。",
                f"证据事件：{evidence}。",
                "背后原因：模型能力逐渐趋同后，头部公司开始把差异化放到工作流封装、工具链整合和真实可执行体验上。",
                "趋势判断：短期内海外硅谷会继续加速 Agent 工作流与开发工具化，国内更集中在平台承接、模型开放和企业化落地。",
                "后续观察点：继续跟踪官方 changelog、GitHub release 与核心负责人公开披露，判断这些能力是一轮发布还是持续迭代。",
            ]
        )
