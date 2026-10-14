import { assemble } from "@/lib/assemble";
import snapshot from "../../../../data/baseline.json";
import type { Baseline } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  try {
    const fresh = assemble(snapshot as Baseline);
    return Response.json(fresh);
  } catch {
    const fallback = snapshot as Baseline;
    return Response.json({
      ...fallback,
      readAt: new Date().toISOString(),
      failures: [
        "The reference folder could not be read. Snapshot values are shown.",
        ...fallback.failures,
      ],
    });
  }
}
