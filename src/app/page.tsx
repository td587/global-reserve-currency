import { Presentation } from "@/components/presentation";
import snapshot from "../../data/baseline.json";
import type { Baseline } from "@/lib/types";

export default function Page() {
  return <Presentation initial={snapshot as Baseline} />;
}
