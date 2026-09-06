export type VisualType =
  | "title"
  | "concept"
  | "fx"
  | "money-supply"
  | "inflation-fx"
  | "pillars"
  | "gold"
  | "collapse"
  | "bretton"
  | "bretton-daily"
  | "nixon"
  | "usd-rise"
  | "privilege"
  | "plumbing"
  | "triffin"
  | "reserve-share"
  | "challenges"
  | "takeaways";

export type Slide = {
  id: string;
  eyebrow?: string;
  title: string;
  body: string;
  points?: string[];
  footnote?: string;
  visual: VisualType;
};

export const slides: Slide[] = [
  {
    id: "title",
    eyebrow: "Global Finance",
    title: "The Reserve Currency",
    body: "How one currency becomes the world’s settlement language—and why that power reshapes trade, debt, and inflation.",
    visual: "title",
  },
  {
    id: "what-is",
    eyebrow: "Foundations",
    title: "What is a reserve currency?",
    body: "Central banks hold foreign currencies and safe assets so they can stabilize their own money, pay for imports, and weather crises.",
    points: [
      "Reserves settle cross-border claims when local currency is not accepted",
      "They back confidence in pegs, imports of energy and food, and emergency liquidity",
      "The currency everyone wants to hold becomes the system’s hub",
    ],
    visual: "concept",
  },
  {
    id: "fx-moves",
    eyebrow: "Exchange rates",
    title: "How currencies move against each other",
    body: "An exchange rate is a price. More demand for dollars relative to euros pushes EUR/USD down—the dollar strengthens.",
    points: [
      "Trade flows, interest rates, and risk appetite shift demand",
      "Capital seeks higher real returns and safer assets",
      "In a float, markets clear continuously; in a peg, the central bank must intervene",
    ],
    footnote: "Illustrative EUR/USD path—educational, not live market data.",
    visual: "fx",
  },
  {
    id: "money-supply",
    eyebrow: "Domestic money",
    title: "More money can mean higher inflation",
    body: "If the money supply grows faster than the economy’s ability to produce goods and services, prices tend to rise.",
    points: [
      "Central banks expand money via credit, asset purchases, and policy rates",
      "Too much money chasing the same basket of goods → inflation pressure",
      "Expectations matter: if people expect inflation, they spend sooner",
    ],
    visual: "money-supply",
  },
  {
    id: "inflation-fx",
    eyebrow: "Purchasing power",
    title: "Inflation feeds into exchange rates",
    body: "If Country A inflates faster than Country B, A’s currency usually buys less abroad over time—its exchange rate weakens.",
    points: [
      "Relative inflation erodes purchasing-power parity",
      "Investors demand higher yields to hold the weaker currency",
      "Chronic inflation makes a currency a poor reserve candidate",
    ],
    visual: "inflation-fx",
  },
  {
    id: "reserve-worthy",
    eyebrow: "Criteria",
    title: "What makes a currency reserve-worthy?",
    body: "Network effects reward depth and trust. Reserves pile into markets you can enter and exit at scale without breaking prices.",
    points: [
      "Rule of law and credible institutions",
      "Deep, liquid government bond markets",
      "Free convertibility and open capital accounts",
      "Widespread use in trade invoicing and finance",
    ],
    visual: "pillars",
  },
  {
    id: "gold-standard",
    eyebrow: "History · ~1870–1914",
    title: "What was the gold standard?",
    body: "Currencies were defined as a fixed weight of gold. You could convert notes into metal—so money printing was tightly constrained.",
    points: [
      "Fixed gold parities linked national money supplies",
      "Gold outflows forced tighter policy; inflows allowed expansion",
      "Exchange rates between gold countries stayed near mint parities",
    ],
    visual: "gold",
  },
  {
    id: "gold-collapse",
    eyebrow: "History · 1914–1930s",
    title: "Why the gold standard broke",
    body: "War finance, unequal gold stocks, and depression politics made fixed convertibility unbearable. Countries suspended gold to print and spend.",
    points: [
      "WWI shattered convertibility as governments financed conflict",
      "Interwar restoration attempts were brittle and deflationary",
      "The 1930s saw competitive devaluations and capital controls",
    ],
    visual: "collapse",
  },
  {
    id: "bretton-woods",
    eyebrow: "History · 1944",
    title: "How Bretton Woods worked",
    body: "The dollar was pegged to gold at $35/oz. Other currencies pegged to the dollar. The IMF oversaw adjustable fixed rates.",
    points: [
      "USD became the hub currency of the postwar system",
      "Members could adjust pegs for “fundamental disequilibrium”",
      "Capital controls were common; trade liberalization was the priority",
    ],
    visual: "bretton",
  },
  {
    id: "bretton-daily",
    eyebrow: "Mechanics",
    title: "Bretton Woods day to day",
    body: "Central banks bought and sold dollars to defend pegs. The U.S. promised foreign official holders gold convertibility—until dollars abroad outgrew U.S. gold.",
    points: [
      "Peg defense required dollar reserves and FX intervention",
      "U.S. deficits supplied the dollars the world needed for growth",
      "That same dollar overhang eroded confidence in the gold promise",
    ],
    visual: "bretton-daily",
  },
  {
    id: "nixon",
    eyebrow: "History · 1971",
    title: "The Nixon shock and floating rates",
    body: "In August 1971 the U.S. closed the gold window. Pegs unraveled. Major currencies moved to managed floats that still dominate today.",
    points: [
      "Official gold convertibility for dollars ended",
      "Smithsonian attempt at new pegs failed within years",
      "Modern FX is mostly floating with occasional intervention",
    ],
    visual: "nixon",
  },
  {
    id: "usd-rise",
    eyebrow: "Ascent",
    title: "How the dollar became dominant",
    body: "Postwar U.S. industrial power, deep Treasuries markets, oil priced in dollars, and network effects locked the USD in as the default.",
    points: [
      "WWII left the U.S. as the intact industrial creditor",
      "Marshall Plan and trade rebuilt Europe around dollar finance",
      "Petrodollar recycling and global capital markets reinforced the hub",
    ],
    visual: "usd-rise",
  },
  {
    id: "privilege",
    eyebrow: "Power",
    title: "Why the central currency is so powerful",
    body: "Issuing the world’s reserve asset is an “exorbitant privilege”: cheaper borrowing, global demand for your debt, and unmatched sanctions leverage.",
    points: [
      "Foreigners absorb your bonds, keeping funding costs lower",
      "You can run larger external deficits with less crisis pressure",
      "Access to dollar clearing is a geopolitical chokepoint",
    ],
    visual: "privilege",
  },
  {
    id: "plumbing",
    eyebrow: "Infrastructure",
    title: "Dollar plumbing",
    body: "Trade invoices, commodity contracts, and bank funding often clear in dollars—even when neither party is American.",
    points: [
      "U.S. Treasuries are the global safe asset and collateral backbone",
      "Correspondent banking routes dollar payments worldwide",
      "Liquidity in dollars sets the tempo of global credit cycles",
    ],
    visual: "plumbing",
  },
  {
    id: "triffin",
    eyebrow: "Tension",
    title: "The Triffin dilemma",
    body: "The world needs the reserve issuer to supply dollars abroad—but that supply can undermine confidence in the very currency everyone holds.",
    points: [
      "Global liquidity requires U.S. external deficits (or lending)",
      "Persistent deficits raise questions about long-run sustainability",
      "Every reserve system carries this structural contradiction",
    ],
    visual: "triffin",
  },
  {
    id: "todays-mix",
    eyebrow: "Today",
    title: "Who holds what now?",
    body: "Allocated global FX reserves remain dollar-heavy. The euro is second; yen, pound, and renminbi trail. Shares shift slowly.",
    points: [
      "USD still the clear majority of allocated reserves",
      "EUR provides the main alternative within deep markets",
      "CNY’s rise is real but constrained by convertibility and depth",
    ],
    footnote: "Illustrative COFER-style shares for teaching—not an official IMF release.",
    visual: "reserve-share",
  },
  {
    id: "challenges",
    eyebrow: "Outlook",
    title: "What could challenge the dollar?",
    body: "A multipolar mix is more likely than a sudden flip. Challengers need trust, liquid safe assets, and open capital markets—not just GDP size.",
    points: [
      "Geopolitics and sanctions spur diversification talk",
      "Euro and renminbi face institutional or capital-account limits",
      "Digital money may change rails without automatically changing the reserve unit",
    ],
    visual: "challenges",
  },
  {
    id: "takeaways",
    eyebrow: "Recap",
    title: "The chain that creates privilege",
    body: "Trust → liquid markets → network effects → reserve demand → cheaper funding and global influence.",
    points: [
      "FX prices relative money and confidence",
      "Gold and Bretton Woods were successive attempts to anchor trust",
      "Floating rates kept the dollar hub via markets, not metal",
      "Privilege lasts only as long as the network believes",
    ],
    visual: "takeaways",
  },
];
