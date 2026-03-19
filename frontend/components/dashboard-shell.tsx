"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

import { TrackerToolbar } from "@/components/tracker-toolbar";
import { formatDecimal, formatLocalDate, formatLocalDateTime, formatPercent } from "@/lib/format";
import { parseReportSections } from "@/lib/report-utils";
import { labelMergeType, labelTheme, labelTier } from "@/lib/theme-labels";
import { cleanText } from "@/lib/text";
import { useTrackerData } from "@/lib/use-tracker-data";
import type { DashboardData, TrackerEvent } from "@/lib/types";

function sourceHealthLabel(value?: string) {
  if (!value) {
    return "等待更新";
  }
  if (value.startsWith("healthy_no_new_items")) {
    return "本轮无新增";
  }
  if (value.startsWith("healthy")) {
    return "稳定在线";
  }
  return "需要重试";
}

type DashboardShellProps = {
  initialData?: DashboardData;
};

export function DashboardShell({ initialData }: DashboardShellProps) {
  const { data, health, isLoading, isPending, error, statusMessage, refresh } = useTrackerData(initialData);
  const topSignals = data.events.slice(0, 10);
  const spotlight = topSignals[0];
  const signalTicker = data.events.slice(0, 10);
  const sourceRows = data.sources.slice(0, 8);
  const evidenceEvents = data.events.slice(0, 4);
  const dailySections = parseReportSections(data.reports.daily_markdown).slice(0, 2);
  const weeklySections = parseReportSections(data.reports.weekly_markdown).slice(0, 2);

  const metricCards = [
    { label: "24 小时新事件", value: String(data.metrics.new_events_24h), tone: "warm" },
    { label: "一手源占比", value: formatPercent(data.metrics.first_party_ratio), tone: "cool" },
    { label: "海外事件占比", value: formatPercent(data.metrics.overseas_ratio), tone: "neutral" },
    { label: "高优先级事件", value: String(data.metrics.high_priority_events), tone: "warm" }
  ];

  return (
    <main className="page-shell news-home">
      <TrackerToolbar
        health={health}
        lastSuccessAt={data.metrics.last_success_at}
        isPending={isPending}
        error={error}
        statusMessage={statusMessage}
        onRefresh={() => void refresh()}
      />

      <section className="flash-tape editorial-reveal reveal-2" aria-label="实时快讯导读">
        <span className="flash-tape__label">LIVE DESK</span>
        <div className="flash-tape__track">
          {signalTicker.length === 0 ? <span className="flash-tape__item">正在等待下一轮实时抓取。</span> : null}
          {signalTicker.map((event) => (
            <article className="flash-tape__card" key={event.merged_event_id}>
              <div className="flash-tape__meta">
                <strong>{cleanText(event.company, "AI 产品")}</strong>
                <span>{labelTier(event.primary_source_tier)}</span>
              </div>
              <p>{cleanText(event.canonical_title, "实时产品动态")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="headline-strip editorial-reveal reveal-3">
        <div className="headline-copy-wrap">
          <p className="eyebrow">AI Pulse Tracker v2</p>
          <h1>持续追踪国内外 AI 产品动态的 Live 情报台</h1>
          <p className="headline-copy">
            围绕海外硅谷一手源、官方产品页、GitHub release 和国内头部平台更新，持续抓取、筛选、
            归并并输出实时快讯、趋势判断与日报周报。
          </p>
          <div className="headline-actions">
            <Link href="/events">进入事件库</Link>
            <Link href="/reports">查看日报周报</Link>
          </div>
        </div>

        <div className="headline-side">
          <div className="headline-side__block">
            <span className="side-kicker">最近成功更新</span>
            <strong>{formatLocalDateTime(data.metrics.last_success_at)}</strong>
            <p>首页默认展示最近一次成功的 live 快照，点击“立即刷新”会触发新一轮抓取并自动回写到页面。</p>
          </div>
          <div className="headline-mini-grid">
            {metricCards.map((item, index) => (
              <article
                className={`mini-metric tone-${item.tone}`}
                key={item.label}
                style={{ "--delay": `${0.08 * index}s` } as CSSProperties}
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-grid">
        <article className="lead-panel panel editorial-reveal reveal-4">
          <div className="lead-panel__head">
            <div>
              <p className="section-kicker">当前焦点</p>
              <h2>{cleanText(spotlight?.canonical_title, "实时焦点正在生成中")}</h2>
            </div>
            <span className="time-tag">{formatLocalDateTime(spotlight?.event_date ?? data.metrics.last_success_at)}</span>
          </div>

          <div className="lead-panel__body">
            <div className="lead-meta">
              <span>{labelTheme(data.strongest_trend || "agent")}</span>
              <span>{labelTier(spotlight?.primary_source_tier ?? "T0")}</span>
              <span>{spotlight ? labelMergeType(spotlight.merge_type) : "主事件"}</span>
            </div>
            <p className="lead-summary">
              {cleanText(
                spotlight?.core_change,
                "系统会把当前证据最强、最能代表当下产品迭代方向的动态提升到焦点位。"
              )}
            </p>
            <div className="lead-trust">
              <div>
                <span>主体公司</span>
                <strong>{cleanText(spotlight?.company, "AI 产品")}</strong>
              </div>
              <div>
                <span>支撑来源</span>
                <strong>{spotlight?.sources_count ?? 0}</strong>
              </div>
              <div>
                <span>新颖度</span>
                <strong>{formatDecimal(spotlight?.processed_items?.[0]?.novelty_score, 2)}</strong>
              </div>
            </div>
          </div>

          <div className="lead-panel__footer">
            <a href={spotlight?.primary_source_url ?? "#"} rel="noreferrer" target="_blank">
              查看主源
            </a>
            <Link href="/events">查看完整事件链</Link>
          </div>
        </article>

        <div className="hero-stack">
          <article className="panel metrics-panel editorial-reveal reveal-5">
            <div className="panel-head">
              <h2>实时指标</h2>
              <span>{isLoading ? "正在同步…" : "持续滚动更新"}</span>
            </div>
            <div className="metrics-list">
              <div>
                <span>最近成功更新</span>
                <strong>{formatLocalDateTime(data.metrics.last_success_at)}</strong>
              </div>
              <div>
                <span>24 小时新事件</span>
                <strong>{data.metrics.new_events_24h}</strong>
              </div>
              <div>
                <span>一手源占比</span>
                <strong>{formatPercent(data.metrics.first_party_ratio)}</strong>
              </div>
              <div>
                <span>海外事件占比</span>
                <strong>{formatPercent(data.metrics.overseas_ratio)}</strong>
              </div>
              <div>
                <span>高优先级事件</span>
                <strong>{data.metrics.high_priority_events}</strong>
              </div>
              <div>
                <span>Job 成功率</span>
                <strong>{formatPercent(data.metrics.job_success_rate)}</strong>
              </div>
            </div>
          </article>

          <article className="panel editorial-reveal reveal-6">
            <div className="panel-head">
              <h2>重点来源池</h2>
              <span>source health</span>
            </div>
            <div className="source-list">
              {sourceRows.map((source) => (
                <div className="source-row compact" key={source.source_name}>
                  <div>
                    <strong>{cleanText(source.source_name, "重点数据源")}</strong>
                    <p>{source.source_type}</p>
                  </div>
                  <div className="source-status">
                    <span>{labelTier(source.source_tier)}</span>
                    <small>{sourceHealthLabel(source.health.extractor_status)}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid-two editorial-reveal reveal-7">
        <article className="panel analysis-panel analysis-panel--featured">
          <div className="panel-head">
            <h2>趋势判断</h2>
            <span>{labelTheme(data.strongest_trend || "agent")}</span>
          </div>
          <blockquote className="analysis-quote">
            {cleanText(
              data.overview,
              "系统会基于当前 live 快照持续产出趋势判断，重点观察 Agent、多模态、开发工具化和企业落地。"
            )}
          </blockquote>
          <div className="analysis-grid">
            <div>
              <span>证据最强趋势</span>
              <strong>{labelTheme(data.strongest_trend || "agent")}</strong>
            </div>
            <div>
              <span>证据偏弱趋势</span>
              <strong>{labelTheme(data.weakest_evidence_trend || "multimodal")}</strong>
            </div>
            <div>
              <span>热门公司</span>
              <strong>{(data.trend_snapshot.hot_companies ?? []).slice(0, 3).join(" / ") || "暂无"}</strong>
            </div>
            <div>
              <span>热门产品</span>
              <strong>{(data.trend_snapshot.hot_products ?? []).slice(0, 3).join(" / ") || "暂无"}</strong>
            </div>
          </div>
          <div className="observation-list">
            {data.observation_cards.map((card) => (
              <div className="observation-card" key={card}>
                {cleanText(card, "系统已生成今日观察结论。")}
              </div>
            ))}
          </div>
        </article>

        <article className="panel evidence-panel">
          <div className="panel-head">
            <h2>证据快照</h2>
            <span>live evidence</span>
          </div>
          <div className="badge-row">
            {(data.trend_snapshot.top_themes ?? []).map((theme) => (
              <span className="badge" key={theme}>
                {labelTheme(theme)}
              </span>
            ))}
          </div>
          <div className="evidence-grid">
            <div>
              <span>一手源占比</span>
              <strong>{formatPercent(data.trend_snapshot.first_hand_ratio)}</strong>
            </div>
            <div>
              <span>官方源占比</span>
              <strong>{formatPercent(data.trend_snapshot.official_ratio_in_priority)}</strong>
            </div>
            <div>
              <span>发布类占比</span>
              <strong>{formatPercent(data.trend_snapshot.release_vs_update?.release)}</strong>
            </div>
            <div>
              <span>更新类占比</span>
              <strong>{formatPercent(data.trend_snapshot.release_vs_update?.update)}</strong>
            </div>
          </div>
          <div className="evidence-links">
            {evidenceEvents.map((event) => (
              <a href={event.primary_source_url} key={event.merged_event_id} rel="noreferrer" target="_blank">
                <div className="evidence-links__meta">
                  <span>{labelTier(event.primary_source_tier)}</span>
                  <span>{formatLocalDate(event.event_date)}</span>
                </div>
                <strong>{cleanText(event.canonical_title, "查看主源")}</strong>
                <small>{cleanText(event.core_change, "当前动态已进入证据快照。")}</small>
              </a>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid content-grid--wide">
        <article className="panel feed-panel editorial-reveal reveal-8">
          <div className="panel-head">
            <h2>实时快讯流</h2>
            <span>高密度滚动追踪国内外 AI 产品动态</span>
          </div>
          <div className="news-stream">
            {topSignals.length === 0 ? <p className="empty-tip">当前暂无可展示事件，正在等待下一轮 live 抓取。</p> : null}
            {topSignals.map((event, index) => (
              <RealtimeStreamItem event={event} index={index} key={event.merged_event_id} />
            ))}
          </div>
        </article>

        <aside className="side-stack">
          <article className="panel report-card report-card--daily editorial-reveal reveal-9">
            <div className="panel-head">
              <h2>实时日报</h2>
              <span>按日压缩最重要变化</span>
            </div>
            <ReportPreview sections={dailySections} />
            <div className="report-card__footer">
              <Link href="/reports">查看完整日报</Link>
            </div>
          </article>

          <article className="panel report-card report-card--weekly editorial-reveal reveal-10">
            <div className="panel-head">
              <h2>趋势周报</h2>
              <span>沉淀近几周核心判断</span>
            </div>
            <ReportPreview sections={weeklySections} />
            <div className="report-card__footer">
              <Link href="/reports">查看完整周报</Link>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function RealtimeStreamItem({ event, index }: { event: TrackerEvent; index: number }) {
  const processed = event.processed_items[0];
  const summary = cleanText(
    processed?.summary_cn,
    cleanText(event.core_change, "该动态已进入实时监控与趋势分析链路。")
  );
  const reasons = (processed?.explain_score ?? []).slice(0, 3);

  return (
    <article className="stream-item stream-item--dense editorial-reveal" style={{ "--delay": `${0.04 * index}s` } as CSSProperties}>
      <div className="stream-date">
        <strong>{formatLocalDate(event.event_date)}</strong>
        <small>{processed?.realtime_bucket ?? "12h"}</small>
      </div>
      <div className="stream-body">
        <div className="stream-topline">
          <span>{cleanText(event.company, "AI 产品")}</span>
          <span>{labelTier(event.primary_source_tier)}</span>
          <span>{labelMergeType(event.merge_type)}</span>
          <span>{processed?.evidence_type ?? "official_release"}</span>
        </div>
        <h3>{cleanText(event.canonical_title, "实时产品动态")}</h3>
        <p className="stream-summary">{summary}</p>
        <div className="badge-row">
          {event.trend_tags.map((tag) => (
            <span className="badge" key={tag}>
              {labelTheme(tag)}
            </span>
          ))}
        </div>
        <div className="stream-explain">
          {reasons.map((reason) => (
            <span key={reason}>{cleanText(reason, "已完成筛选与归并判断。")}</span>
          ))}
        </div>
        <div className="stream-footer">
          <div className="stream-meta">
            <span>新颖度 {formatDecimal(processed?.novelty_score, 2)}</span>
            <span>来源 {event.sources_count}</span>
            <span>可信度 {formatDecimal(event.confidence, 2)}</span>
          </div>
          <a href={event.primary_source_url} rel="noreferrer" target="_blank">
            打开主源
          </a>
        </div>
      </div>
    </article>
  );
}

function ReportPreview({ sections }: { sections: ReturnType<typeof parseReportSections> }) {
  return (
    <div className="report-card__content">
      {sections.map((section) => (
        <section className="report-preview-block" key={section.title}>
          <div className="report-preview-block__head">
            <span className="report-preview-block__title">{section.title}</span>
          </div>
          <div className="report-preview-block__list">
            {section.items.slice(0, 3).map((item, index) => (
              <div className="report-card__row report-card__row--rich" key={`${section.title}-${index}`}>
                <span className="report-card__index">{String(index + 1).padStart(2, "0")}</span>
                <div className="report-card__body">
                  <p>{item.text}</p>
                  {item.url ? (
                    <a className="report-inline-link" href={item.url} rel="noreferrer" target="_blank">
                      查看原文
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
