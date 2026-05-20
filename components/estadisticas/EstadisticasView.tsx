"use client";

import type { CollectionStats } from "@/types/app";
import StatsHero from "./StatsHero";
import TradableCard from "./TradableCard";
import SpecialsCard from "./SpecialsCard";
import TopRepeatedList from "./TopRepeatedList";
import SectionProgressList from "./SectionProgressList";
import TimelineRow from "./TimelineRow";

type Props = { skeleton: true } | { skeleton?: false; stats: CollectionStats };

// Skeleton layout — same structure as the real view, all placeholders.
// Kept as a named function so EstadisticasView's discriminated union early-return
// doesn't violate the hooks rule (there are no hooks here, but the pattern is
// established for future additions).
function EstadisticasSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 pb-24 pt-20">
      <StatsHero skeleton />
      <TradableCard skeleton />
      <SpecialsCard skeleton />
      <TopRepeatedList skeleton />
      <SectionProgressList skeleton />
      <TimelineRow skeleton />
    </div>
  );
}

export default function EstadisticasView(props: Props) {
  if (props.skeleton) return <EstadisticasSkeleton />;

  const { stats } = props;

  return (
    <div className="flex flex-col gap-3 px-4 pb-24 pt-20">
      <StatsHero
        percentage={stats.percentage}
        owned={stats.owned}
        total={stats.owned + stats.missing}
        missing={stats.missing}
      />
      <TradableCard available={stats.available} />
      <SpecialsCard owned={stats.ownedSpecials} total={stats.totalSpecials} />
      <TopRepeatedList items={stats.topRepeated} />
      <SectionProgressList sections={stats.sectionProgress} />
      <TimelineRow
        daysCollecting={stats.daysCollecting}
        streak={stats.currentStreak}
      />
    </div>
  );
}
