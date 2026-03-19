from __future__ import annotations

from collections import defaultdict
from difflib import SequenceMatcher

from app.pipeline.models import ProcessedItem, RawItem


class SignalEnhancerAgent:
    COMPANY_MAP = [
        ("codex", ("OpenAI", "Codex")),
        ("openai", ("OpenAI", "OpenAI API")),
        ("anthropic", ("Anthropic", "Claude")),
        ("claude", ("Anthropic", "Claude")),
        ("gemini robotics", ("Google DeepMind", "Gemini Robotics")),
        ("robotics", ("Google DeepMind", "Gemini Robotics")),
        ("gemini", ("Google DeepMind", "Gemini")),
        ("llama", ("Meta", "Llama 4")),
        ("ernie", ("Baidu", "ERNIE 4.5")),
        ("hunyuan", ("Tencent", "混元")),
        ("bailian", ("Alibaba Cloud", "百炼")),
        ("tongyi", ("Alibaba Cloud", "通义")),
        ("cursor", ("Cursor", "Cursor")),
        ("windsurf", ("Codeium", "Windsurf")),
        ("replit", ("Replit", "Agents")),
    ]
    EVENT_MAP = {
        "agent": "agent_workflow_upgrade",
        "workflow": "agent_workflow_upgrade",
        "api": "api_sdk_update",
        "sdk": "api_sdk_update",
        "education": "enterprise_opening",
        "robotics": "feature_update",
        "open source": "open_source_release",
        "release": "new_product",
        "launch": "new_product",
        "changelog": "feature_update",
    }
    EVIDENCE_MAP = {
        "official_blog": "official_release",
        "official_product_page": "official_release",
        "official_changelog": "changelog",
        "github_release": "github_release",
        "community": "community_signal",
        "media": "media_report",
    }

    def process(self, items: list[RawItem]) -> list[ProcessedItem]:
        processed: list[ProcessedItem] = []
        history: dict[tuple[str, str], list[str]] = defaultdict(list)
        for item in items:
            company, product = self._extract_company_product(item)
            event_type = self._extract_event_type(item)
            keywords = self._extract_keywords(item)
            novelty = self._novelty_score(item, company, product, keywords, history)
            history[(company, product)].append(f"{item.title} {' '.join(keywords)}")
            processed.append(
                ProcessedItem(
                    item_id=item.id,
                    company=company,
                    product=product,
                    event_type=event_type,
                    summary_cn=self._summary_cn(company, product, event_type),
                    keywords=keywords,
                    is_first_party=1 if item.source_tier in {"T0", "T1"} else 0,
                    signal_score=0.0,
                    usefulness_score=0.0,
                    silicon_valley_score=0.95 if item.region == "global" else 0.35,
                    novelty_score=round(novelty, 2),
                    evidence_type=self.EVIDENCE_MAP.get(item.source_type, "community_signal"),
                    is_product_signal=0,
                    keep_for_analysis=0,
                    dedupe_group_id=f"{company.lower().replace(' ', '-')}-{product.lower().replace(' ', '-')}",
                    realtime_bucket="3h" if item.source_tier in {"T0", "T1"} else ("6h" if item.region == "global" else "12h"),
                    explain_score=[],
                )
            )
        return processed

    def _extract_company_product(self, item: RawItem) -> tuple[str, str]:
        text = f"{item.title} {item.raw_text} {item.url}".lower()
        for keyword, value in self.COMPANY_MAP:
            if keyword in text:
                return value
        return item.source_name, item.source_name

    def _extract_event_type(self, item: RawItem) -> str:
        text = f"{item.title} {item.raw_text}".lower()
        for keyword, value in self.EVENT_MAP.items():
            if keyword in text:
                return value
        return "feature_update"

    def _extract_keywords(self, item: RawItem) -> list[str]:
        text = f"{item.title} {item.raw_text}".lower()
        keywords = []
        for keyword in [
            "agent",
            "api",
            "sdk",
            "workflow",
            "multimodal",
            "robotics",
            "open source",
            "education",
            "developer tools",
            "release",
            "launch",
        ]:
            if keyword in text:
                keywords.append(keyword)
        if item.region == "global":
            keywords.append("silicon-valley")
        return sorted(set(keywords))

    def _novelty_score(
        self,
        item: RawItem,
        company: str,
        product: str,
        keywords: list[str],
        history: dict[tuple[str, str], list[str]],
    ) -> float:
        past = history[(company, product)]
        if not past:
            inverse_similarity = 0.95
        else:
            ratio = max(
                SequenceMatcher(None, f"{item.title} {' '.join(keywords)}".lower(), entry.lower()).ratio()
                for entry in past
            )
            inverse_similarity = max(0.15, 1 - ratio)
        new_keyword_bonus = 0.15 if any(word in keywords for word in ["robotics", "education", "developer tools", "release"]) else 0.05
        tier_bonus = 0.15 if item.source_tier == "T0" else 0.08
        return min(1.0, inverse_similarity + new_keyword_bonus + tier_bonus)

    def _summary_cn(self, company: str, product: str, event_type: str) -> str:
        mapping = {
            "agent_workflow_upgrade": f"{company} 正在强化 {product} 的 Agent 工作流能力，产品形态继续向可执行任务链路演进。",
            "api_sdk_update": f"{company} 围绕 {product} 推出新的 API 或 SDK 能力，重点强化开发者集成和工作流接入。",
            "enterprise_opening": f"{company} 正在把 {product} 推向平台化和企业化场景，说明竞争正在从模型能力转向交付能力。",
            "open_source_release": f"{company} 通过 {product} 强化开源路线，继续缩短先进能力向生态扩散的周期。",
            "new_product": f"{company} 发布了与 {product} 相关的新产品或新版本，属于需要优先跟踪的一手产品动态。",
            "feature_update": f"{company} 围绕 {product} 推出新能力，显示产品功能仍在持续迭代和场景扩展。",
        }
        return mapping.get(event_type, f"{company} 发布了关于 {product} 的新动态。")
