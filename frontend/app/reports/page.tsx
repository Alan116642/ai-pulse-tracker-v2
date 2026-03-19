import { ReportsBoard } from "@/components/reports-board";
import { readInitialLiveData } from "@/lib/server-live-data";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const initialData = await readInitialLiveData();
  return <ReportsBoard initialData={initialData} />;
}
