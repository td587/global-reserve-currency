const EPISODES = [
  {
    when: "2020–21",
    title: "Goods bottleneck",
    body: "Used vehicles and core goods printed extreme y/y as supply chains and demand for durables collided.",
    toggle: "Used vehicles",
  },
  {
    when: "2021–22",
    title: "Energy & food",
    body: "Energy CPI soared into mid-2022 (Ukraine war as a sharp overlay on an already tight oil market); food followed global logistics and commodity stress.",
    toggle: "Energy · Food",
  },
  {
    when: "2021–23",
    title: "Demand impulse",
    body: "SF Fed Shapiro’s demand-driven PCE contribution rose with fiscal support and reopening — a literature lens, not a CPI residual.",
    toggle: "Demand (PCE lens)",
  },
  {
    when: "2022–24",
    title: "Shelter lag",
    body: "New leases cooled before owners’ equivalent rent; shelter kept headline sticky after goods and energy faded.",
    toggle: "Shelter",
  },
];

export function Episodes() {
  return (
    <section className="border-t border-white/10 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-[0.65rem] tracking-[0.22em] text-mist uppercase">
          Episodes
        </p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl text-paper md:text-4xl">
          Real shocks, labeled for the toggles
        </h2>
        <p className="mt-3 max-w-xl text-sm text-mist md:text-base">
          One job per row: match the story to the switch you just used above.
        </p>
        <ol className="mt-12 space-y-10 md:space-y-12">
          {EPISODES.map((ep, i) => (
            <li
              key={ep.title}
              className="grid gap-3 border-t border-white/10 pt-8 md:grid-cols-[7rem_1fr_10rem] md:gap-8"
            >
              <p className="tabular-nums text-sm text-ember">{ep.when}</p>
              <div>
                <h3 className="font-serif text-2xl text-paper">
                  <span className="mr-3 text-mist/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {ep.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist md:text-base">
                  {ep.body}
                </p>
              </div>
              <p className="text-xs tracking-wide text-teal uppercase md:text-right">
                Toggle · {ep.toggle}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
