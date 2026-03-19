"use client";

import Link from "next/link";

import { TrackerToolbar } from "@/components/tracker-toolbar";
import { formatLocalDateTime, formatPercent } from "@/lib/format";
import { parseReportSections } from "@/lib/report-utils";
import { labelTheme, labelTier } from "@/lib/theme-labels";
import { cleanText } from "@/lib/text";
import { useTrackerData } from "@/lib/use-tracker-data";
import type { DashboardData } from "@/lib/types";

type ReportsBoardProps = {
  initialData?: DashboardData;
};

export function ReportsBoard({ initialData }: ReportsBoardProps) {
  const { data, health, isPending, error, statusMessage, refresh } = useTrackerData(initialData);
  const dailySections = parseReportSections(data.reports.daily_markdown);
  const weeklySections = parseReportSections(data.reports.weekly_markdown);
  const featuredEvents = data.events.slice(0, 5);

  return (
    <main className="page-shell secondary-page">
      <TrackerToolbar
        health={health}
        lastSuccessAt={data.metrics.last_success_at}
        isPending={isPending}
        error={error}
        statusMessage={statusMessage}
        onRefresh={() => void refresh()}
      />

      <div className="page-nav editorial-reveal reveal-2">
        <Link href="/">返回首页</Link>
        <Link href="/events">查看事件库</Link>
      </div>

      <section className="grid-two editorial-reveal reveal-3">
        <article className="panel analysis-panel analysis-panel--featured">
          <div className="panel-head">
            <h1>趋势判断</h1>
            <span>{labelTheme(data.strongest_trend || "agent")}</span>
          </div>
          <blockquote className="analysis-quote">
            {cleanText(
              data.overview,
              "系统已基于最新 live 快照生成趋势判断，重点关注 Agent、多模态、开发工具化与企业落地。"
            )}
          </blockquote>
          <div className="snapshot-grid snapshot-grid--stats">
            <div>
              <span>最近成功更新</span>
              <strong>{formatLocalDateTime(data.metrics.last_success_at)}</strong>
            </div>
            <div>
              <span>一手源占比</span>
              <strong>{formatPercent(data.trend_snapshot.first_hand_ratio)}</strong>
            </div>
            <div>
              <span>官方源占比</span>
              <strong>{formatPercent(data.trend_snapshot.official_ratio_in_priority)}</strong>
            </div>
            <div>
              <span>海外事件占比</span>
              <strong>{formatPercent(data.trend_snapshot.region_ratio?.global)}</strong>
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
            <h1>证据快照</h1>
            <span>snapshot</span>
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
              <span>热门公司</span>
              <strong>{(data.trend_snapshot.hot_companies ?? []).join(" / ") || "暂无"}</strong>
            </div>
            <div>
              <span>热门产品</span>
              <strong>{(data.trend_snapshot.hot_products ?? []).join(" / ") || "暂无"}</strong>
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
            {featuredEvents.slice(0, 4).map((event) => (
              <a href={event.primary_source_url} key={event.merged_event_id} rel="noreferrer" target="_blank">
                <div className="evidence-links__meta">
                  <span>{labelTier(event.primary_source_tier)}</span>
                  <span>{cleanText(event.company, "AI 产品")}</span>
                </div>
                <strong>{cleanText(event.canonical_title, "查看主源")}</strong>
                <small>{cleanText(event.core_change, "当前动态已进入证据快照。")}</small>
              </a>
            ))}
          </div>
        </article>
      </section>

      <section className="report-deck report-deck--stack editorial-reveal reveal-4">
        <article className="panel report-sheet report-sheet--daily">
          <div className="panel-head">
            <h1>实时日报</h1>
            <span>按日压缩最重要变化</span>
          </div>
          <RichReport sections={dailySections} />
          <div className="report-source-links">
            {featuredEvents.slice(0, 3).map((event) => (
              <a href={event.primary_source_url} key={event.merged_event_id} rel="noreferrer" target="_blank">
                <span>{labelTier(event.primary_source_tier)}</span>
                <strong>{cleanText(event.company, "AI 产品")}</strong>
              </a>
            ))}
          </div>
        </article>

        <article className="panel report-sheet report-sheet--weekly">
          <div className="panel-head">
            <h1>趋势周报</h1>
            <span>沉淀近几周核心判断</span>
          </div>
          <RichReport sections={weeklySections} />
          <div className="report-source-links">
            {featuredEvents.slice(0, 4).map((event) => (
              <a href={event.primary_source_url} key={event.merged_event_id} rel="noreferrer" target="_blank">
                <span>{labelTier(event.primary_source_tier)}</span>
                <strong>{cleanText(event.canonical_title, "查看事件主源")}</strong>
              </a>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function RichReport({ sections }: { sections: ReturnType<typeof parseReportSections> }) {
  return (
    <div className="report-sections">
      {sections.map((section) => (
        <section className="report-section" key={section.title}>
          <div className="report-section__header">
            <h3>{section.title}</h3>
            <span>{section.items.length} 条</span>
          </div>
          <div className="report-section__list">
            {section.items.map((item, index) => (
              <div className="report-section__item report-section__item--rich" key={`${section.title}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="report-section__body">
                  <p>{item.text}</p>
                  {item.url ? (
                    <a className="report-inline-link" href={item.url} rel="noreferrer" target="_blank">
                      查看链接
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
