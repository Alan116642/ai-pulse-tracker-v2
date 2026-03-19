import { readFile } from "fs/promises";
import path from "path";

import { liveFallbackData } from "@/lib/live-fallback";
import type { DashboardData } from "@/lib/types";

export async function readInitialLiveData(): Promise<DashboardData> {
  try {
    const filePath = path.join(process.cwd(), "public", "live", "dashboard.json");
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as DashboardData;
    return parsed;
  } catch {
    return liveFallbackData;
  }
}
