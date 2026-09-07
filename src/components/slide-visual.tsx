"use client";

import type { VisualType } from "@/lib/slides";
import { BrettonVisual } from "@/components/visuals/bretton";
import { BrettonDailyVisual } from "@/components/visuals/bretton-daily";
import { ChallengesVisual } from "@/components/visuals/challenges";
import { CollapseVisual } from "@/components/visuals/collapse";
import { ConceptVisual } from "@/components/visuals/concept";
import { FxChart } from "@/components/visuals/fx-chart";
import { GoldVisual } from "@/components/visuals/gold";
import { InflationFxVisual } from "@/components/visuals/inflation-fx";
import { MoneySupplyVisual } from "@/components/visuals/money-supply";
import { NixonVisual } from "@/components/visuals/nixon";
import { PillarsVisual } from "@/components/visuals/pillars";
import { PlumbingVisual } from "@/components/visuals/plumbing";
import { PrivilegeVisual } from "@/components/visuals/privilege";
import { DominanceTimelineVisual } from "@/components/visuals/dominance-timeline";
import { ReserveShareVisual } from "@/components/visuals/reserve-share";
import { TakeawaysVisual } from "@/components/visuals/takeaways";
import { TitleVisual } from "@/components/visuals/title-visual";
import { TriffinVisual } from "@/components/visuals/triffin";
import { UsdRiseVisual } from "@/components/visuals/usd-rise";

export function SlideVisual({ type }: { type: VisualType }) {
  switch (type) {
    case "title":
      return <TitleVisual />;
    case "concept":
      return <ConceptVisual />;
    case "fx":
      return <FxChart />;
    case "money-supply":
      return <MoneySupplyVisual />;
    case "inflation-fx":
      return <InflationFxVisual />;
    case "pillars":
      return <PillarsVisual />;
    case "gold":
      return <GoldVisual />;
    case "collapse":
      return <CollapseVisual />;
    case "bretton":
      return <BrettonVisual />;
    case "bretton-daily":
      return <BrettonDailyVisual />;
    case "nixon":
      return <NixonVisual />;
    case "usd-rise":
      return <UsdRiseVisual />;
    case "privilege":
      return <PrivilegeVisual />;
    case "plumbing":
      return <PlumbingVisual />;
    case "triffin":
      return <TriffinVisual />;
    case "reserve-share":
      return <ReserveShareVisual />;
    case "dominance-timeline":
      return <DominanceTimelineVisual />;
    case "challenges":
      return <ChallengesVisual />;
    case "takeaways":
      return <TakeawaysVisual />;
    default:
      return null;
  }
}
