import { createClient } from "@/lib/supabase/server";
import { getReceivedTrades, getSentTrades } from "@/lib/db/trades";
import TradesInboxSheet from "./TradesInboxSheet";

interface IntercambiosDataProps {
  userId: string;
}

// Server Component — fetches trades data and renders TradesInboxSheet.
// Rendered inside a <Suspense> in page.tsx so the skeleton FAB appears
// immediately while these queries resolve.
export default async function IntercambiosData({
  userId,
}: IntercambiosDataProps) {
  const supabase = await createClient();

  const [receivedTrades, sentTrades] = await Promise.all([
    getReceivedTrades(supabase, userId),
    getSentTrades(supabase, userId),
  ]);

  return (
    <TradesInboxSheet
      receivedTrades={receivedTrades}
      sentTrades={sentTrades}
      pendingCount={receivedTrades.length}
    />
  );
}
