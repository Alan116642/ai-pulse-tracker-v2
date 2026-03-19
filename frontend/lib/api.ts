import { liveFallbackData } from "@/lib/live-fallback";
import type { DashboardData, HealthData, TrackerMode } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8010/api";

type RunPipelineResponse = {
  status: string;
  mode: TrackerMode;
  generated_at: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const stamp = Date.now();
  const live = await fetchJson<DashboardData>(`${API_BASE}/dashboard/overview?t=${stamp}`);
  if (live) {
    return live;
  }

  const staticPayload = await fetchJson<DashboardData>(`/live/dashboard.json?t=${stamp}`);
  if (staticPayload) {
    return staticPayload;
  }

  return liveFallbackData;
}

export async function fetchHealthData(): Promise<HealthData | null> {
  return fetchJson<HealthData>(`${API_BASE}/health?t=${Date.now()}`);
}

export async function runPipeline(mode: TrackerMode): Promise<RunPipelineResponse | null> {
  return fetchJson<RunPipelineResponse>(`${API_BASE}/jobs/run-now`, {
    method: "POST",
    body: JSON.stringify({ mode })
  });
}
