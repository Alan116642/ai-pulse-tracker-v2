window.DASHBOARD_DATA = {
  "generated_at": "2026-03-17T20:30:00+08:00",
  "mode": "demo",
  "metrics": {
    "last_success_at": "2026-03-17T20:30:00+08:00",
    "new_events_24h": 9,
    "first_party_ratio": 0.83,
    "overseas_ratio": 0.78,
    "high_priority_events": 6,
    "job_success_rate": 0.96
  },
  "overview": "海外头部公司正把竞争从模型能力继续推向 Agent 执行、开发者入口与多模态延展，国内厂商则更强调开源与平台承接。",
  "strongest_trend": "Agent 与开发者工具化",
  "weakest_evidence_trend": "国内多模态入口",
  "observation_cards": [
    "今日最值得关注变化：开发者入口正成为海外 AI 产品竞争的新主线。",
    "今日海外最强信号：OpenAI 通过 Codex 与 Agent 工具链强化工程代理路线。",
    "今日国内跟进点：百度以 ERNIE 4.5 开源系列承接国内开源生态。"
  ],
  "events": [
    {
      "merged_event_id": "evt-001",
      "canonical_title": "OpenAI 发布 Codex，强化工程代理产品形态",
      "company": "OpenAI",
      "product": "Codex",
      "event_date": "2025-05-16T10:00:00+00:00",
      "core_change": "编码代理从辅助聊天升级到可并行执行任务的工作流产品。",
      "sources_count": 3,
      "primary_source_url": "https://openai.com/index/introducing-codex/",
      "confidence": 0.96,
      "merge_type": "same_event",
      "primary_source_tier": "T0",
      "trend_tags": ["agent", "developer_tooling"],
      "processed_items": [{
        "signal_score": 0.97,
        "usefulness_score": 0.95,
        "is_first_party": 1,
        "silicon_valley_score": 0.95,
        "novelty_score": 0.94,
        "explain_score": ["已确认属于 AI 产品动态。", "一手源和 source_tier 已进入评分。", "novelty_score 体现近 7 天同公司同产品的新颖度。"]
      }]
    },
    {
      "merged_event_id": "evt-002",
      "canonical_title": "OpenAI 推出面向 Agent 的新 API 工具链",
      "company": "OpenAI",
      "product": "OpenAI API",
      "event_date": "2025-03-11T09:00:00+00:00",
      "core_change": "从模型提供转向生产级 Agent 工作流基础设施。",
      "sources_count": 2,
      "primary_source_url": "https://openai.com/index/new-tools-for-building-agents/",
      "confidence": 0.95,
      "merge_type": "same_event",
      "primary_source_tier": "T0",
      "trend_tags": ["developer_tooling", "enterprise"],
      "processed_items": [{
        "signal_score": 0.95,
        "usefulness_score": 0.94,
        "is_first_party": 1,
        "silicon_valley_score": 0.95,
        "novelty_score": 0.9,
        "explain_score": ["已确认属于 AI 产品动态。", "一手源和 source_tier 已进入评分。", "novelty_score 体现近 7 天同公司同产品的新颖度。"]
      }]
    },
    {
      "merged_event_id": "evt-004",
      "canonical_title": "Gemini Robotics 推动多模态进入具身执行",
      "company": "Google DeepMind",
      "product": "Gemini Robotics",
      "event_date": "2025-03-12T11:00:00+00:00",
      "core_change": "多模态能力从感知走向物理执行和机器人应用。",
      "sources_count": 2,
      "primary_source_url": "https://deepmind.google/discover/blog/gemini-robotics-brings-ai-into-the-physical-world/",
      "confidence": 0.91,
      "merge_type": "same_event",
      "primary_source_tier": "T0",
      "trend_tags": ["multimodal"],
      "processed_items": [{
        "signal_score": 0.89,
        "usefulness_score": 0.88,
        "is_first_party": 1,
        "silicon_valley_score": 0.95,
        "novelty_score": 0.84,
        "explain_score": ["已确认属于 AI 产品动态。", "一手源和 source_tier 已进入评分。", "novelty_score 体现近 7 天同公司同产品的新颖度。"]
      }]
    },
    {
      "merged_event_id": "evt-005",
      "canonical_title": "Meta 与百度分别强化开源模型路线",
      "company": "Meta / Baidu",
      "product": "Llama 4 / ERNIE 4.5",
      "event_date": "2025-06-30T02:00:00+00:00",
      "core_change": "开源模型与开源 Agent 工具链继续缩短能力扩散周期，国内外同步加速。",
      "sources_count": 2,
      "primary_source_url": "https://ai.meta.com/blog/llama-4-multimodal-intelligence/",
      "confidence": 0.84,
      "merge_type": "event_update",
      "primary_source_tier": "T0",
      "trend_tags": ["open_source"],
      "processed_items": [{
        "signal_score": 0.88,
        "usefulness_score": 0.87,
        "is_first_party": 1,
        "silicon_valley_score": 0.35,
        "novelty_score": 0.83,
        "explain_score": ["已确认属于 AI 产品动态。", "开源能力变化进入趋势分析。", "event_update 表示同一能力演进链路中的补充更新。"]
      }]
    }
  ],
  "sources": [
    {
      "source_name": "OpenAI News",
      "source_type": "official_blog",
      "source_tier": "T0",
      "region": "global",
      "health": { "last_success_at": "2026-03-17T20:15:00+08:00", "success_rate_7d": 0.99, "avg_latency_ms": 481, "extractor_status": "healthy" }
    },
    {
      "source_name": "Anthropic News",
      "source_type": "official_blog",
      "source_tier": "T0",
      "region": "global",
      "health": { "last_success_at": "2026-03-17T20:10:00+08:00", "success_rate_7d": 0.98, "avg_latency_ms": 522, "extractor_status": "healthy" }
    },
    {
      "source_name": "百度智能云千帆",
      "source_type": "official_product_page",
      "source_tier": "T0",
      "region": "cn",
      "health": { "last_success_at": "2026-03-17T18:00:00+08:00", "success_rate_7d": 0.94, "avg_latency_ms": 832, "extractor_status": "healthy" }
    }
  ],
  "reports": {
    "daily_markdown": "# AI Pulse Tracker 日报\n\n- OpenAI 持续把模型能力封装进可执行的工程代理与工作流工具链。\n- Codex 和 Agent API 工具链是今天最强的海外一手信号。\n- 百度通过 ERNIE 4.5 开源动作强化国内跟进。\n",
    "weekly_markdown": "# AI Pulse Tracker 周报\n\n- 海外公司继续从模型能力扩展到 Agent 执行、开发工具化和多模态入口。\n- 国内厂商继续在开源与平台承接上同步跟进。\n"
  },
  "job_status": [
    { "stage": "collect", "status": "success", "message": "items=6", "finished_at": "2026-03-17T20:30:00+08:00" },
    { "stage": "enrich", "status": "success", "message": "items=6", "finished_at": "2026-03-17T20:30:01+08:00" },
    { "stage": "filter", "status": "success", "message": "retained=6", "finished_at": "2026-03-17T20:30:01+08:00" },
    { "stage": "merge", "status": "success", "message": "events=4", "finished_at": "2026-03-17T20:30:02+08:00" },
    { "stage": "analyze", "status": "success", "message": "report-7d-demo", "finished_at": "2026-03-17T20:30:02+08:00" }
  ]
};
