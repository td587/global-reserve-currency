"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlideVisual } from "@/components/slide-visual";
import { slides } from "@/lib/slides";
import { cn } from "@/lib/utils";

export function SlideDeck() {
  const [index, setIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const total = slides.length;
  const slide = slides[index];

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(total - 1, next)));
    },
    [total]
  );

  const prev = useCallback(() => go(index - 1), [go, index]);
  const next = useCallback(() => go(index + 1), [go, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(total - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <div
      className="deck-grid relative flex min-h-dvh flex-col"
      onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        if (Math.abs(dx) > 50) {
          if (dx < 0) next();
          else prev();
        }
        setTouchStartX(null);
      }}
    >
      <header className="flex items-center justify-between gap-4 px-4 pt-4 md:px-8 md:pt-6">
        <div>
          <p className="text-[0.65rem] tracking-[0.22em] text-steel uppercase md:text-xs">
            Global Finance
          </p>
          <p className="font-serif text-sm text-paper/90 md:text-base">
            Reserve Currency
          </p>
        </div>
        <p className="tabular-nums text-sm text-steel-soft">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
        <article
          key={slide.id}
          className="animate-slide-in grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center"
        >
          <div className="flex flex-col justify-center">
            {slide.eyebrow && (
              <p className="mb-3 text-xs tracking-[0.2em] text-gold uppercase">
                {slide.eyebrow}
              </p>
            )}
            <h1
              className={cn(
                "font-serif leading-[1.1] text-paper",
                slide.visual === "title"
                  ? "text-4xl md:text-6xl lg:text-7xl"
                  : "text-3xl md:text-5xl"
              )}
            >
              {slide.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-steel-soft md:mt-5 md:text-lg">
              {slide.body}
            </p>
            {slide.points && slide.points.length > 0 && (
              <ul className="mt-5 space-y-2.5 md:mt-6">
                {slide.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-relaxed text-paper/90 md:text-base"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-steel" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {slide.footnote && (
              <p className="mt-5 text-xs text-steel/70 md:mt-6">{slide.footnote}</p>
            )}
          </div>

          <div className="min-h-[280px] md:min-h-[340px] lg:min-h-[380px]">
            <SlideVisual type={slide.visual} />
          </div>
        </article>
      </main>

      <footer className="px-4 pb-5 md:px-8 md:pb-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}: ${s.title}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => go(i)}
                className={cn(
                  "h-1.5 shrink-0 rounded-full transition-all",
                  i === index
                    ? "w-6 bg-gold"
                    : "w-1.5 bg-steel/35 hover:bg-steel/70"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={prev}
              disabled={index === 0}
              className="border-border bg-card/50 text-paper hover:bg-card"
            >
              <ChevronLeft data-icon="inline-start" />
              Prev
            </Button>
            <p className="hidden text-xs tracking-[0.16em] text-steel uppercase sm:block">
              Arrow keys · swipe on mobile
            </p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={next}
              disabled={index === total - 1}
              className="border-border bg-card/50 text-paper hover:bg-card"
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
