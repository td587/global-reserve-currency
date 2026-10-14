import { assemble } from "@/lib/assemble";
import { applyLive } from "@/lib/live";
import snapshot from "../../../../data/baseline.json";
import type { Baseline } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const live = new URL(request.url).searchParams.get("live") === "1";
  try {
    const fresh = assemble(snapshot as Baseline);
    const body = live ? await applyLive(fresh) : fresh;
    return Response.json(body);
  } catch {
    const fallback = snapshot as Baseline;
    return Response.json({
      ...fallback,
      readAt: new Date().toISOString(),
      failures: [
        live
          ? "Live pull failed. Snapshot values are shown."
          : "The reference folder could not be read. Snapshot values are shown.",
        ...fallback.failures,
      ],
    });
  }
}
