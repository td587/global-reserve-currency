"use client";

const perks = [
  { title: "Cheaper debt", copy: "Global buyers bid for your bonds" },
  { title: "Deficit room", copy: "External gaps close more slowly" },
  { title: "Sanctions power", copy: "Clearing access is leverage" },
];

export function PrivilegeVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="rounded-xl border border-gold/35 bg-gradient-to-br from-gold/15 to-transparent p-5 md:p-6">
        <p className="text-xs tracking-[0.18em] text-gold uppercase">
          Exorbitant privilege
        </p>
        <p className="mt-2 font-serif text-3xl text-paper md:text-4xl">
          Print the asset everyone else must hold
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {perks.map((p, i) => (
          <div
            key={p.title}
            className="animate-slide-in rounded-xl border border-border bg-card/65 p-4"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <p className="font-serif text-xl text-paper">{p.title}</p>
            <p className="mt-1 text-sm text-steel-soft">{p.copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
