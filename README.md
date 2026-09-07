# Global Reserve Currency Slide Deck

Interactive educational presentation on how a global reserve currency works—exchange rates, money supply and inflation, the gold standard, Bretton Woods, the dollar’s rise, and exorbitant privilege.

## Run locally

```bash
npm install
npm run dev -- --port 43125
```

Open [http://127.0.0.1:43125](http://127.0.0.1:43125).

## Navigation

- Arrow keys, Page Up/Down, Home/End
- Prev / Next buttons
- Progress dots
- Swipe on mobile

## Data sources (interactive slides)

- **IMF COFER** — Currency Composition of Official Foreign Exchange Reserves (allocated shares). Primary source for composition from the mid-1990s onward; earlier postwar figures in the teaching table are from IMF/ECB compiled series commonly cited in reserve-currency research.
- **ECB long-run research** — e.g. Eichengreen, Mehl & Chiţu, *Stability or upheaval?* (ECB Working Paper 1715) on sterling–dollar transition after WWII.
- **Eichengreen & Flandreau** — reconstructions of interwar FX-reserve shares (dollar overtakes sterling in the mid-1920s in key samples).

Pre-1965 points on the century chart are **rounded scholarly estimates** for teaching, not official COFER releases. Gold remained the primary reserve asset before WWII.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
