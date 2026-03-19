"use client";

import type { CSSProperties } from "react";

import { formatLocalDateTime } from "@/lib/format";
import type { HealthData } from "@/lib/types";

type TrackerToolbarProps = {
  health: HealthData | null;
  lastSuccessAt?: string;
  isPending: boolean;
  error: string;
  statusMessage?: string;
  onRefresh: () => void;
};

export function TrackerToolbar(props: TrackerToolbarProps) {
  const { health, lastSuccessAt, isPending, error, statusMessage, onRefresh } = props;
  const isOnline = health?.status === "ok" || Boolean(lastSuccessAt);
  const statusText = isOnline ? "实时引擎在线" : "当前展示最近成功快照";
  const statusCopy = isOnline
    ? "页面每 60 秒自动拉取一次最新快照，也支持手动触发一次完整的实时抓取。"
    : "后端正在恢复或部分源短时不可用，页面会优先保留最近一次成功抓取的内容。";

  return (
    <section className="live-toolbar editorial-reveal reveal-1" aria-live="polite">
      <div className="live-status">
        <span className={`pulse ${isOnline ? "online" : "offline"}`} aria-hidden="true" />
        <div className="live-status-copy">
          <strong>{statusText}</strong>
          <small>{statusCopy}</small>
        </div>
      </div>

      <div className="toolbar-actions">
        <div className="toolbar-meta">
          <span className="toolbar-chip">LIVE 实时追踪</span>
          <span className="toolbar-chip">实时窗口 3h / 6h / 12h</span>
          <span className="toolbar-chip">趋势窗口 7d / 30d / 90d</span>
          <span className="toolbar-chip">最近成功更新 {formatLocalDateTime(lastSuccessAt)}</span>
        </div>
        <button
          aria-label="立即刷新实时情报"
          className={`refresh-button ${isPending ? "is-loading" : ""}`}
          disabled={isPending}
          onClick={onRefresh}
          style={{ "--button-scale": isPending ? 1 : 0.98 } as CSSProperties}
          type="button"
        >
          <span className="refresh-button__label">{isPending ? "正在刷新…" : "立即刷新"}</span>
        </button>
      </div>

      {error ? <p className="toolbar-error">{error}</p> : null}
      {!error && statusMessage ? <p className="toolbar-note">{statusMessage}</p> : null}
    </section>
  );
}
