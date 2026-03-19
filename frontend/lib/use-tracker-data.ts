"use client";

import { useEffect, useRef, useState } from "react";

import { fetchDashboardData, fetchHealthData, runPipeline } from "@/lib/api";
import { liveFallbackData } from "@/lib/live-fallback";
import { formatLocalClock } from "@/lib/format";
import type { DashboardData, HealthData, TrackerMode } from "@/lib/types";

type TrackerState = {
  data: DashboardData;
  health: HealthData | null;
  isLoading: boolean;
  isPending: boolean;
  error: string;
  statusMessage: string;
  refresh: () => Promise<void>;
};

function isUsableSnapshot(snapshot: DashboardData | null | undefined) {
  if (!snapshot) {
    return false;
  }

  return (
    (snapshot.events?.length ?? 0) > 0 ||
    (snapshot.metrics.high_priority_events ?? 0) > 0 ||
    (snapshot.metrics.new_events_24h ?? 0) > 0
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useTrackerData(initialData?: DashboardData): TrackerState {
  const safeInitial = initialData ?? liveFallbackData;
  const [data, setData] = useState<DashboardData>(safeInitial);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(!isUsableSnapshot(safeInitial));
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    isUsableSnapshot(safeInitial) ? "已加载最近一次有效的 live 快照。" : ""
  );
  const lastUsableRef = useRef<DashboardData>(isUsableSnapshot(safeInitial) ? safeInitial : liveFallbackData);

  async function loadSnapshot() {
    const [snapshot, healthInfo] = await Promise.all([fetchDashboardData(), fetchHealthData()]);
    const usable = isUsableSnapshot(snapshot);

    setHealth(healthInfo);
    setIsLoading(false);

    if (usable && snapshot) {
      setData(snapshot);
      lastUsableRef.current = snapshot;
      setError("");
      setStatusMessage(`快照已同步：${formatLocalClock(new Date().toISOString())}`);
      return { usable: true, healthInfo, snapshot };
    }

    setData(lastUsableRef.current);

    if (healthInfo) {
      setError("实时抓取暂未产出新快照，页面已自动回退到最近一次成功内容。");
      setStatusMessage("当前继续展示最近一次有效快照。");
    } else {
      setError("后端暂时不可达，当前展示的是最近一次缓存的 live 快照。");
      setStatusMessage("页面已回退到缓存快照。");
    }

    return { usable: false, healthInfo, snapshot: lastUsableRef.current };
  }

  async function refresh() {
    if (isPending) {
      return;
    }

    const previousSuccessAt = lastUsableRef.current.metrics.last_success_at;
    setIsPending(true);
    setError("");
    setStatusMessage("正在触发实时抓取，请稍候…");

    try {
      const run = await runPipeline("live" as TrackerMode);
      if (!run || run.status !== "ok") {
        setError("实时任务触发失败，页面已保留最近一次有效快照。");
        setStatusMessage("当前继续展示最近一次有效结果。");
        return;
      }

      setStatusMessage(`实时任务已触发：${formatLocalClock(run.generated_at)}`);

      for (let index = 0; index < 8; index += 1) {
        const result = await loadSnapshot();
        const nextSuccessAt = result.snapshot?.metrics.last_success_at ?? "";

        if (result.usable && nextSuccessAt && nextSuccessAt !== previousSuccessAt) {
          setStatusMessage(`已手动刷新：${formatLocalClock(nextSuccessAt)}`);
          return;
        }

        if (index < 7) {
          setStatusMessage("已收到任务响应，正在等待新快照写入…");
          await sleep(1000);
        }
      }

      setStatusMessage("刷新已执行完成，当前继续展示最近一次有效结果。");
    } finally {
      setIsPending(false);
    }
  }

  useEffect(() => {
    void (async () => {
      const result = await loadSnapshot();
      if (!result.usable && result.healthInfo) {
        await refresh();
      }
    })();

    const timer = window.setInterval(() => {
      void loadSnapshot();
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  return {
    data,
    health,
    isLoading,
    isPending,
    error,
    statusMessage,
    refresh
  };
}
