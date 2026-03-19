import { DashboardShell } from "@/components/dashboard-shell";
import { readInitialLiveData } from "@/lib/server-live-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialData = await readInitialLiveData();
  return <DashboardShell initialData={initialData} />;
}
