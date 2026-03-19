"use client";

import Link from "next/link";
import { useState } from "react";

import { TrackerToolbar } from "@/components/tracker-toolbar";
import { labelMergeType, labelTheme, labelTier } from "@/lib/theme-labels";
import { cleanText } from "@/lib/text";
import { useTrackerData } from "@/lib/use-tracker-data";
import type { DashboardData } from "@/lib/types";

type EventsBoardProps = {
  initialData?: DashboardData;
};

function ratio(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function EventsBoard({ initialData }: EventsBoardProps) {
  const { data, health, isPending, error, statusMessage, refresh } = useTrackerData(initialData);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const tags = Array.from(new Set(data.events.flatMap((event) => event.trend_tags)));
  const events = data.events.filter((event) => {
    if (tagFilter !== "all" && !event.trend_tags.includes(tagFilter)) {
      return false;
    }
    if (tierFilter !== "all" && event.primary_source_tier !== tierFilter) {
      return false;
    }
    return true;
  });

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
        <Link href="/reports">查看趋势分析</Link>
      </div>

      <section className="grid-two editorial-reveal reveal-3">
        <article className="panel">
          <div className="panel-head">
            <h1>实时事件库</h1>
            <span>聚焦高价值产品动态</span>
          </div>
          <p className="overview">
            这里展示已经进入实时监控与趋势分析链路的主事件。每条事件都保留来源等级、归并类型、
            新颖度以及进入分析的解释依据，避免把普通资讯和真正的产品动作混在一起。
          </p>
        </article>
        <article className="panel">
          <div className="panel-head">
            <h1>事件质量快照</h1>
            <span>live metrics</span>
          </div>
          <div className="snapshot-grid">
            <div>
              <span>24 小时新事件</span>
              <strong>{data.metrics.new_events_24h}</strong>
            </div>
            <div>
              <span>高优先级事件</span>
              <strong>{data.metrics.high_priority_events}</strong>
            </div>
            <div>
              <span>一手源占比</span>
              <strong>{ratio(data.metrics.first_party_ratio)}</strong>
            </div>
            <div>
              <span>海外事件占比</span>
              <strong>{ratio(data.metrics.overseas_ratio)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel editorial-reveal reveal-4">
        <div className="panel-head">
          <h2>筛选维度</h2>
          <span>按主题与来源等级查看</span>
        </div>
        <div className="filters-row">
          <div className="chip-group">
            <button className={tagFilter === "all" ? "active" : ""} onClick={() => setTagFilter("all")} type="button">
              全部主题
            </button>
            {tags.map((tag) => (
              <button className={tagFilter === tag ? "active" : ""} key={tag} onClick={() => setTagFilter(tag)} type="button">
                {labelTheme(tag)}
              </button>
            ))}
          </div>
          <div className="chip-group">
            {["all", "T0", "T1", "T2"].map((tier) => (
              <button className={tierFilter === tier ? "active" : ""} key={tier} onClick={() => setTierFilter(tier)} type="button">
                {tier === "all" ? "全部来源等级" : labelTier(tier)}
              </button>
            ))}
          </div>
        </div>

        <div className="event-list-vertical">
          {events.length === 0 ? (
            <p className="empty-tip">当前筛选条件下暂无事件，系统会在下一轮 live 刷新后自动补齐。</p>
          ) : null}
          {events.map((event) => {
            const processed = event.processed_items[0];
            return (
              <article className="event-row detailed" key={event.merged_event_id}>
                <div className="event-main">
                  <div className="event-meta">
                    <span>{cleanText(event.company, "AI 产品")}</span>
                    <span>{labelTier(event.primary_source_tier)}</span>
                    <span>{labelMergeType(event.merge_type)}</span>
                  </div>
                  <h3>{cleanText(event.canonical_title, "实时产品动态")}</h3>
                  <p>
                    {cleanText(
                      event.core_change,
                      "该事件已被系统识别为高价值产品动态，并进入实时监控和趋势分析链路。"
                    )}
                  </p>
                  <div className="badge-row">
                    {event.trend_tags.map((tag) => (
                      <span className="badge" key={tag}>
                        {labelTheme(tag)}
                      </span>
                    ))}
                  </div>
                  <div className="inline-explain">
                    {(processed?.explain_score ?? []).slice(0, 4).map((line) => (
                      <span key={line}>{cleanText(line, "已完成筛选与归并解释。")}</span>
                    ))}
                  </div>
                </div>

                <div className="event-side">
                  <span>支撑来源 {event.sources_count}</span>
                  <span>新颖度 {processed?.novelty_score ?? 0}</span>
                  <span>实时窗口 {processed?.realtime_bucket ?? "12h"}</span>
                  <a href={event.primary_source_url} rel="noreferrer" target="_blank">
                    查看主源
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
