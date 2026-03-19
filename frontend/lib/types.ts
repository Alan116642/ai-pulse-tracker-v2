export type TrackerMode = "demo" | "live";

export type ProcessedItem = {
  item_id?: string;
  company?: string;
  product?: string;
  event_type?: string;
  summary_cn?: string;
  keywords?: string[];
  is_first_party: number;
  signal_score: number;
  usefulness_score: number;
  silicon_valley_score: number;
  novelty_score: number;
  evidence_type?: string;
  is_product_signal: number;
  keep_for_analysis?: number;
  dedupe_group_id?: string;
  realtime_bucket?: string;
  explain_score: string[];
};

export type SupportingSource = {
  merged_event_id?: string;
  raw_item_id: string;
  source_role: string;
};

export type TrackerEvent = {
  merged_event_id: string;
  canonical_title: string;
  company: string;
  product: string;
  event_date: string;
  core_change: string;
  sources_count: number;
  primary_source_url: string;
  confidence: number;
  merge_type: string;
  primary_source_tier: string;
  trend_tags: string[];
  strongest_signal?: string;
  explain_merge?: string[];
  supporting_sources: SupportingSource[];
  processed_items: ProcessedItem[];
};

export type SourceHealth = {
  source_name?: string;
  last_success_at?: string;
  last_item_count?: number;
  success_rate_7d?: number;
  avg_latency_ms?: number;
  extractor_status?: string;
};

export type SourceRecord = {
  source_name: string;
  source_type: string;
  source_tier: string;
  region: string;
  frequency_minutes?: number;
  enabled?: number;
  last_success_at?: string;
  last_error?: string;
  health: SourceHealth;
};

export type JobStatus = {
  id?: number;
  run_id?: string;
  job_name?: string;
  stage: string;
  started_at?: string;
  finished_at: string;
  status: string;
  message: string;
};

export type TrendSnapshot = {
  theme_counts?: Record<string, number>;
  theme_deltas?: Record<string, Record<string, number>>;
  region_ratio?: Record<string, number>;
  first_hand_ratio?: number;
  official_ratio_in_priority?: number;
  hot_companies?: string[];
  hot_products?: string[];
  release_vs_update?: Record<string, number>;
  top_themes?: string[];
  strongest_trend?: string;
  weakest_evidence_trend?: string;
};

export type DashboardData = {
  generated_at: string;
  mode: TrackerMode;
  metrics: {
    total_events?: number;
    new_events_24h: number;
    first_party_ratio: number;
    overseas_ratio: number;
    high_priority_events: number;
    last_success_at: string;
    job_success_rate: number;
  };
  overview: string;
  strongest_trend: string;
  weakest_evidence_trend: string;
  trend_snapshot: TrendSnapshot;
  events: TrackerEvent[];
  observation_cards: string[];
  sources: SourceRecord[];
  reports: {
    daily_markdown: string;
    weekly_markdown: string;
    executive_summary?: {
      one_liner?: string;
      observation_cards?: string[];
    };
    observation_cards?: string[];
  };
  job_status: JobStatus[];
};

export type HealthData = {
  status: string;
  database: string;
  scheduler: string;
  mode: TrackerMode;
};
