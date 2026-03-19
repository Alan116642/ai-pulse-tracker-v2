from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from app.pipeline.models import DashboardSnapshot, MergedEvent, TrendReport

THEME_LABELS = {
    "agent": "Agent 与工作流",
    "developer_tooling": "开发工具化",
    "multimodal": "多模态",
    "enterprise": "企业化落地",
    "open_source": "开源扩散",
}


class PresentationAgent:
    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root
        self.local_zone = ZoneInfo("Asia/Shanghai")

    def publish(self, snapshot: DashboardSnapshot) -> None:
        processed_dir = self.project_root / "data" / "processed"
        reports_dir = self.project_root / "data" / "reports"
        static_dir = self.project_root / "app"
        frontend_demo_dir = self.project_root / "frontend" / "public" / "demo"
        frontend_live_dir = self.project_root / "frontend" / "public" / "live"

        for directory in [processed_dir, reports_dir, static_dir, frontend_demo_dir, frontend_live_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        reports = self._build_reports(snapshot)
        snapshot.reports = {
            **reports,
            "observation_cards": snapshot.observation_cards,
        }

        payload = json.dumps(snapshot.to_dict(), ensure_ascii=False, indent=2)
        for target in [
            processed_dir / "dashboard_data.json",
            static_dir / "dashboard_data.json",
            frontend_demo_dir / "dashboard.json",
            frontend_live_dir / "dashboard.json",
        ]:
            target.write_text(payload, encoding="utf-8")

        (reports_dir / "daily_report.md").write_text(reports["daily_markdown"], encoding="utf-8")
        (reports_dir / "weekly_report.md").write_text(reports["weekly_markdown"], encoding="utf-8")
        (reports_dir / "executive_summary.json").write_text(
            json.dumps(
                {**reports["executive_summary"], "observation_cards": snapshot.observation_cards},
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )

    def build_observation_cards(self, events: list[MergedEvent], trend_report: TrendReport) -> list[str]:
        strongest_event = events[0].canonical_title if events else "暂无重点事件"
        domestic = next(
            (
                event.canonical_title
                for event in events
                if any(name in event.company for name in ["Baidu", "Tencent", "Alibaba", "智谱", "月之暗面", "MiniMax", "百度", "腾讯", "阿里"])
            ),
            "暂无明显国内跟进点",
        )
        strongest_trend = trend_report.snapshot_json.get("strongest_trend", "agent")
        trend_label = THEME_LABELS.get(strongest_trend, strongest_trend)
        return [
            f"今日最值得关注变化：{trend_label}",
            f"今日海外最强信号：{strongest_event}",
            f"今日国内跟进点：{domestic}",
        ]

    def _build_reports(self, snapshot: DashboardSnapshot) -> dict[str, object]:
        top_events = snapshot.events[:6]
        strongest = THEME_LABELS.get(snapshot.strongest_trend, snapshot.strongest_trend or "Agent 与工作流")
        weakest = THEME_LABELS.get(
            snapshot.weakest_evidence_trend, snapshot.weakest_evidence_trend or "多模态"
        )
        companies = " / ".join(snapshot.trend_snapshot.get("hot_companies", [])[:5]) or "暂无"
        products = " / ".join(snapshot.trend_snapshot.get("hot_products", [])[:5]) or "暂无"
        local_updated = self._format_local_datetime(snapshot.metrics.get("last_success_at", ""))

        daily_lines = [
            "# AI Pulse Tracker 实时日报",
            "",
            "## 今日概览",
            f"- 最近成功更新时间：{local_updated}",
            f"- 今日核心判断：{snapshot.overview}",
            f"- 24 小时新事件：{snapshot.metrics.get('new_events_24h', 0)}",
            f"- 高优先级事件：{snapshot.metrics.get('high_priority_events', 0)}",
            "",
            "## 今日最值得看的实时信号",
        ]
        daily_lines.extend(self._report_event_lines(top_events))
        daily_lines.extend(
            [
                "",
                "## 观察结论卡",
                *[f"- {line}" for line in snapshot.observation_cards[:3]],
            ]
        )

        weekly_lines = [
            "# AI Pulse Tracker 趋势周报",
            "",
            "## 本周判断",
            f"- 最强趋势：{strongest}",
            f"- 证据偏弱趋势：{weakest}",
            f"- 热门公司：{companies}",
            f"- 热门产品：{products}",
            "",
            "## 趋势解读",
            f"- {snapshot.overview}",
            "",
            "## 本周高价值事件",
        ]
        weekly_lines.extend(self._report_event_lines(top_events[:5]))

        executive_summary = {
            "one_liner": snapshot.overview,
            "strongest_trend": strongest,
            "weakest_evidence_trend": weakest,
        }

        return {
            "daily_markdown": "\n".join(daily_lines),
            "weekly_markdown": "\n".join(weekly_lines),
            "executive_summary": executive_summary,
        }

    def _report_event_lines(self, events: list[dict]) -> list[str]:
        lines: list[str] = []
        for event in events:
            lines.append(
                f"- {event['canonical_title']}｜来源等级 {event['primary_source_tier']}｜{event['core_change']}｜主源: {event['primary_source_url']}"
            )
        return lines

    def _format_local_datetime(self, value: str) -> str:
        if not value:
            return "--"
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            local_value = parsed.astimezone(self.local_zone)
            return (
                f"{local_value.year}/{local_value.month}/{local_value.day} "
                f"{local_value.hour:02d}:{local_value.minute:02d}"
            )
        except ValueError:
            return value
