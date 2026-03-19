import type { DashboardData } from "@/lib/types";

export const demoData: DashboardData = {
  generated_at: "2026-03-17T20:30:00+08:00",
  mode: "demo",
  metrics: {
    last_success_at: "2026-03-17T20:30:00+08:00",
    new_events_24h: 9,
    first_party_ratio: 0.83,
    overseas_ratio: 0.78,
    high_priority_events: 6,
    job_success_rate: 0.96
  },
  overview:
    "海外头部公司正把竞争从模型能力扩展到 Agent 执行、开发者入口与多模态延展，国内厂商则更强调开源与平台承接。",
  strongest_trend: "Agent 与开发者工具化",
  weakest_evidence_trend: "国内多模态入口",
  trend_snapshot: {
    theme_counts: {
      agent: 2,
      developer_tooling: 2,
      multimodal: 1,
      open_source: 1
    },
    theme_deltas: {
      "7d_vs_30d": {
        agent: 0.5,
        developer_tooling: 0.5,
        multimodal: 0.25,
        open_source: 0.25
      },
      "30d_vs_90d": {
        agent: 0.4,
        developer_tooling: 0.4,
        multimodal: 0.2,
        open_source: 0.2
      }
    },
    region_ratio: {
      global: 0.78,
      cn: 0.22
    },
    first_hand_ratio: 0.83,
    official_ratio_in_priority: 0.83,
    hot_companies: ["OpenAI", "Google DeepMind", "Meta / Baidu"],
    hot_products: ["Codex", "OpenAI API", "Gemini Robotics", "Llama 4 / ERNIE 4.5"],
    release_vs_update: {
      release: 0.75,
      update: 0.25
    },
    top_themes: ["agent", "developer_tooling", "multimodal", "open_source"],
    strongest_trend: "Agent 与开发者工具化",
    weakest_evidence_trend: "国内多模态入口"
  },
  observation_cards: [
    "今日最值得关注变化：开发者入口正在成为海外 AI 产品竞争的新主线。",
    "今日海外最强信号：OpenAI 通过 Codex 与 Agent 工具链强化工程代理链路。",
    "今日国内跟进点：百度以 ERNIE 4.5 开源系列承接国内开源生态。"
  ],
  events: [
    {
      merged_event_id: "evt-001",
      canonical_title: "OpenAI 发布 Codex，强化工程代理产品形态",
      company: "OpenAI",
      product: "Codex",
      event_date: "2025-05-16T10:00:00+00:00",
      core_change: "编码代理从辅助聊天升级到可并行执行任务的工作流产品。",
      sources_count: 3,
      primary_source_url: "https://openai.com/index/introducing-codex/",
      confidence: 0.96,
      merge_type: "same_event",
      primary_source_tier: "T0",
      trend_tags: ["agent", "developer_tooling"],
      strongest_signal: "OpenAI 强化 Codex 的 Agent 工作流能力，产品形态进一步走向可执行任务链路。",
      supporting_sources: [
        { raw_item_id: "raw-001", source_role: "primary" },
        { raw_item_id: "raw-002", source_role: "supporting" }
      ],
      processed_items: [
        {
          signal_score: 0.97,
          usefulness_score: 0.95,
          is_first_party: 1,
          is_product_signal: 1,
          silicon_valley_score: 0.95,
          novelty_score: 0.94,
          explain_score: [
            "已确认属于 AI 产品动态。",
            "一手源和 source_tier 已进入评分。",
            "novelty_score 体现近 7 天同公司同产品的新颖度。"
          ]
        }
      ]
    },
    {
      merged_event_id: "evt-002",
      canonical_title: "OpenAI 推出面向 Agent 的新 API 工具链",
      company: "OpenAI",
      product: "OpenAI API",
      event_date: "2025-03-11T09:00:00+00:00",
      core_change: "能力竞争从模型本身转向生产级 Agent 工作流基础设施。",
      sources_count: 2,
      primary_source_url: "https://openai.com/index/new-tools-for-building-agents/",
      confidence: 0.95,
      merge_type: "same_event",
      primary_source_tier: "T0",
      trend_tags: ["developer_tooling", "enterprise"],
      strongest_signal: "OpenAI 围绕 API 推出新的 Agent 工具链，强调开发者工作流与生产部署。",
      supporting_sources: [{ raw_item_id: "raw-002", source_role: "primary" }],
      processed_items: [
        {
          signal_score: 0.95,
          usefulness_score: 0.94,
          is_first_party: 1,
          is_product_signal: 1,
          silicon_valley_score: 0.95,
          novelty_score: 0.9,
          explain_score: [
            "已确认属于 AI 产品动态。",
            "一手源和 source_tier 已进入评分。",
            "novelty_score 体现近 7 天同公司同产品的新颖度。"
          ]
        }
      ]
    },
    {
      merged_event_id: "evt-004",
      canonical_title: "Gemini Robotics 推动多模态进入具身执行",
      company: "Google DeepMind",
      product: "Gemini Robotics",
      event_date: "2025-03-12T11:00:00+00:00",
      core_change: "多模态能力从感知走向物理执行和机器人应用。",
      sources_count: 2,
      primary_source_url: "https://deepmind.google/discover/blog/gemini-robotics-brings-ai-into-the-physical-world/",
      confidence: 0.91,
      merge_type: "same_event",
      primary_source_tier: "T0",
      trend_tags: ["multimodal"],
      strongest_signal: "Google DeepMind 围绕 Gemini Robotics 推出新能力，显示多模态执行继续向具体场景落地。",
      supporting_sources: [{ raw_item_id: "raw-004", source_role: "primary" }],
      processed_items: [
        {
          signal_score: 0.89,
          usefulness_score: 0.88,
          is_first_party: 1,
          is_product_signal: 1,
          silicon_valley_score: 0.95,
          novelty_score: 0.84,
          explain_score: [
            "已确认属于 AI 产品动态。",
            "一手源和 source_tier 已进入评分。",
            "novelty_score 体现近 7 天同公司同产品的新颖度。"
          ]
        }
      ]
    },
    {
      merged_event_id: "evt-005",
      canonical_title: "Meta 与百度分别强化开源模型路线",
      company: "Meta / Baidu",
      product: "Llama 4 / ERNIE 4.5",
      event_date: "2025-06-30T02:00:00+00:00",
      core_change: "开源模型与开源 Agent 工具链继续缩短能力扩散周期，国内外同步加速。",
      sources_count: 2,
      primary_source_url: "https://ai.meta.com/blog/llama-4-multimodal-intelligence/",
      confidence: 0.84,
      merge_type: "event_update",
      primary_source_tier: "T0",
      trend_tags: ["open_source"],
      strongest_signal: "Meta 与百度通过开源路线推动模型能力更快扩散。",
      supporting_sources: [
        { raw_item_id: "raw-005", source_role: "primary" },
        { raw_item_id: "raw-006", source_role: "event_update" }
      ],
      processed_items: [
        {
          signal_score: 0.88,
          usefulness_score: 0.87,
          is_first_party: 1,
          is_product_signal: 1,
          silicon_valley_score: 0.72,
          novelty_score: 0.83,
          explain_score: [
            "已确认属于 AI 产品动态。",
            "开源能力变化进入趋势分析。",
            "event_update 表示同一能力演进链路中的补充更新。"
          ]
        }
      ]
    }
  ],
  sources: [
    {
      source_name: "OpenAI News",
      source_type: "official_blog",
      source_tier: "T0",
      region: "global",
      health: {
        last_success_at: "2026-03-17T20:15:00+08:00",
        success_rate_7d: 0.99,
        avg_latency_ms: 481,
        extractor_status: "healthy"
      }
    },
    {
      source_name: "Anthropic News",
      source_type: "official_blog",
      source_tier: "T0",
      region: "global",
      health: {
        last_success_at: "2026-03-17T20:10:00+08:00",
        success_rate_7d: 0.98,
        avg_latency_ms: 522,
        extractor_status: "healthy"
      }
    },
    {
      source_name: "百度智能云千帆",
      source_type: "official_product_page",
      source_tier: "T0",
      region: "cn",
      health: {
        last_success_at: "2026-03-17T18:00:00+08:00",
        success_rate_7d: 0.94,
        avg_latency_ms: 832,
        extractor_status: "healthy"
      }
    }
  ],
  reports: {
    daily_markdown:
      "# AI Pulse Tracker 日报\n\n- OpenAI 持续把模型能力封装进可执行的工程代理与工作流工具链。\n- Codex 和 Agent API 工具链是今天最强的海外一手信号。\n- 百度通过 ERNIE 4.5 开源动作强化国内跟进。\n",
    weekly_markdown:
      "# AI Pulse Tracker 周报\n\n- 海外公司继续从模型能力扩展到 Agent 执行、开发工具化和多模态入口。\n- 国内厂商继续在开源与平台承接上同步跟进。\n",
    executive_summary: {
      one_liner: "AI 产品竞争正在从模型能力扩展到 Agent 化执行、开发工具链与多模态入口。"
    }
  },
  job_status: [
    { stage: "collect", status: "success", message: "items=6", finished_at: "2026-03-17T20:30:00+08:00" },
    { stage: "enrich", status: "success", message: "items=6", finished_at: "2026-03-17T20:30:01+08:00" },
    { stage: "filter", status: "success", message: "retained=6", finished_at: "2026-03-17T20:30:01+08:00" },
    { stage: "merge", status: "success", message: "events=4", finished_at: "2026-03-17T20:30:02+08:00" },
    { stage: "analyze", status: "success", message: "report-7d-demo", finished_at: "2026-03-17T20:30:02+08:00" }
  ]
};
