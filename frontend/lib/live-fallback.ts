import type { DashboardData } from "@/lib/types";

export const liveFallbackData: DashboardData = {
  generated_at: "",
  mode: "live",
  metrics: {
    total_events: 0,
    last_success_at: "",
    new_events_24h: 0,
    first_party_ratio: 0,
    overseas_ratio: 0,
    high_priority_events: 0,
    job_success_rate: 0
  },
  overview: "实时引擎正在初始化，页面会优先展示最近一次成功抓取的 live 快照。",
  strongest_trend: "",
  weakest_evidence_trend: "",
  trend_snapshot: {
    top_themes: [],
    hot_companies: [],
    hot_products: [],
    region_ratio: {},
    release_vs_update: {}
  },
  events: [],
  observation_cards: [
    "系统启动后会自动拉取一轮官方源与高频源。",
    "如果接口暂时不可用，页面会保留最近一次成功的 live 快照。",
    "点击右上角“立即刷新”可以手动触发一次全链路更新。"
  ],
  sources: [],
  reports: {
    daily_markdown: "",
    weekly_markdown: "",
    executive_summary: {
      one_liner: "实时引擎正在初始化。"
    },
    observation_cards: []
  },
  job_status: []
};
