import { EventsBoard } from "@/components/events-board";
import { readInitialLiveData } from "@/lib/server-live-data";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const initialData = await readInitialLiveData();
  return <EventsBoard initialData={initialData} />;
}
