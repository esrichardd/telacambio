import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import TradeHeader from "@/components/intercambios/TradeHeader";
import QRCard from "@/components/intercambios/QRCard";
import ProfileLinkCard from "@/components/intercambios/ProfileLinkCard";
import TradesInboxSheet from "@/components/intercambios/TradesInboxSheet";
import IntercambiosData from "@/components/intercambios/IntercambiosData";

export default async function IntercambiosPage() {
  // getCurrentProfile is memoized — layout already called it, no extra DB hit.
  // QRCard and ProfileLinkCard only need the username, so the page shell
  // renders immediately. Only the trades queries are deferred via Suspense.
  const { user, profile } = await getCurrentProfile();

  return (
    <>
      <main className="pt-4 pb-10">
        <div className="max-w-2xl mx-auto px-4">
          <TradeHeader />
          <div className="flex flex-col gap-4 mt-4">
            <QRCard username={profile.username} />
            <ProfileLinkCard username={profile.username} />
          </div>
        </div>
      </main>

      {/* Skeleton FAB appears immediately — replaced by the real sheet when trades load */}
      <Suspense fallback={<TradesInboxSheet skeleton />}>
        <IntercambiosData userId={user.id} />
      </Suspense>
    </>
  );
}
