import { useCallback, useEffect, useState } from 'react';

import carousel1 from '../../assets/images/carousel1.jpg';
import carousel2 from '../../assets/images/carousel2.jpg';
import carousel3 from '../../assets/images/carousel3.jpg';

const SLIDES = [carousel1, carousel2, carousel3];

export default function CustomerHeroCarousel() {
  const maxStart = Math.max(0, SLIDES.length - 2);
  const [pairStart, setPairStart] = useState(0);

  const goPrev = useCallback(() => {
    setPairStart((s) => (s <= 0 ? maxStart : s - 1));
  }, [maxStart]);

  const goNext = useCallback(() => {
    setPairStart((s) => (s >= maxStart ? 0 : s + 1));
  }, [maxStart]);

  useEffect(() => {
    const t = window.setInterval(goNext, 5500);
    return () => window.clearInterval(t);
  }, [goNext]);

  const left = SLIDES[pairStart];
  const right = SLIDES[pairStart + 1];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          key={pairStart}
          className="grid gap-3 transition-all duration-500 ease-out sm:grid-cols-2"
          style={{ opacity: 1 }}
        >
          {[left, right].map((src, i) => (
            <div
              key={`${pairStart}-${i}`}
              className="relative h-[260px] w-full overflow-hidden rounded-shop bg-slate-800 shadow-shop ring-1 ring-white/10 sm:h-[300px] md:h-[360px] lg:h-[400px]"
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover transition-all duration-500 ease-out"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-all duration-300 ease-out hover:bg-white/20"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: maxStart + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide pair ${i + 1}`}
                onClick={() => setPairStart(i)}
                className={[
                  'h-2 rounded-full transition-all duration-300 ease-out',
                  i === pairStart ? 'w-8 bg-brand-light' : 'w-2 bg-white/40',
                ].join(' ')}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-all duration-300 ease-out hover:bg-white/20"
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
