import { Slides } from "@/components/slides";
import snapshot from "../../../data/baseline.json";
import type { Baseline } from "@/lib/types";

export const metadata = {
  title: "Slides · Demand today, supply tomorrow",
};

export default function SlidesPage() {
  return <Slides initial={snapshot as Baseline} />;
}
