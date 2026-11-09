"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollToId } from "@/lib/scroll";
import { useWebGL } from "@/lib/hooks";
import { openRoom, type RoomId } from "@/lib/store";
import ScanLabels from "@/components/hero/ScanLabels";

gsap.registerPlugin(ScrollTrigger);

const FilmScene = dynamic(() => import("@/components/three/FilmScene"), { ssr: false });


const PROJECTS: { id: RoomId; t: string }[] = [
  { id: "automation", t: "AI Automation" },
  { id: "veriai", t: "VeriAI" },
  { id: "rental", t: "Rental App" },
  { id: "cafe", t: "Cyber Café" },
  { id: "ipl", t: "IPL Intelligence" },
];

const FRAMES: { note: string; line: string; sub?: string }[] = [
  {
    note: "frame 1 · the person",
    line: "Battu Dhanush, an engineer building AI and full-stack systems.",
    sub: "Off the screen: skating, and solving puzzles like chess.",
  },
  { note: "frame 2 · the ideas", line: "Every project starts as a scatter of ideas." },
  { note: "frame 3 · the systems", line: "Five of them became working systems. Click one to step inside." },
];

/**
 * A short film you play by scrolling: the screen stays put while the points behind it move from
 * Dhanush's face, to scattered ideas, to five systems (the five projects that follow).
 * With reduced motion it is a single still frame instead.
 */
export default function ScrollFilm() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const labels = useRef<(HTMLElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);
  const webgl = useWebGL();

  /**
   * Frame 1 is the real photo (the same one as the hero). It sits exactly where the point cloud
   * draws the face, so when you start scrolling the photo fades and the points take over.
   * Sizes mirror FilmScene: face 3.3 units tall, camera fov 40°, z 5.4 (7.2 on narrow screens) → 8.6.
   */
  const placePhoto = (p: number) => {
    const el = photo.current, plate = el?.parentElement;
    if (!el || !plate) return;
    const narrow = plate.clientWidth / Math.max(1, plate.clientHeight) < 0.9;
    const faceZ = narrow ? 7.2 : 5.4;
    const a = Math.min(1, Math.max(0, (p - 0.12) / 0.36));
    const z = faceZ + (8.6 - faceZ) * a;
    const tan = Math.tan((20 * Math.PI) / 180);
    el.style.height = `${(3.3 / (2 * faceZ * tan)) * 100}%`;
    el.style.transform = `translate(-50%, -50%) scale(${faceZ / z})`;
    const fade = 1 - Math.min(1, Math.max(0, (p - 0.06) / 0.1));
    el.style.opacity = fade.toFixed(3);
    el.style.visibility = fade <= 0 ? "hidden" : "visible";
  };

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    if (r || !section.current) return;
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress.current = self.progress;
        placePhoto(self.progress);
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
        setFrame(self.progress < 0.3 ? 0 : self.progress < 0.72 ? 1 : 2);
      },
    });
    placePhoto(0);
    const onResize = () => placePhoto(progress.current);
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(section.current);
    return () => {
      st.kill();
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={section} id="film" aria-label="Scroll film: from a photo to five systems" className={reduced ? "relative py-10" : "relative h-[320vh]"}>
      <div className={reduced ? "px-3 md:px-5" : "sticky top-0 h-[100svh] p-2 pt-[84px] md:p-4 md:pt-[92px]"}>
        <div className={`plate relative overflow-hidden rounded-[10px] ${reduced ? "h-[80svh]" : "h-full"}`}>
          {/* soft light in the middle of the screen */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2a2519,transparent_70%)]" />
          {/* frame 1: the real photo, which dissolves into the points as you scroll */}
          {!reduced && (
            <div ref={photo} aria-hidden className="absolute left-1/2 top-1/2 aspect-[1338/1344] will-change-transform" style={{ height: "84%", transform: "translate(-50%, -50%)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="img/dhanush-portrait.webp"
                alt=""
                width={1338}
                height={1344}
                className="h-full w-full object-contain [mask-image:radial-gradient(ellipse_70%_72%_at_50%_46%,black_62%,transparent)]"
              />
              <ScanLabels bootAt={0} hovering animated={false} />
            </div>
          )}
          {webgl && <FilmScene progress={progress} active={active || reduced} still={reduced} labels={labels} />}

          {/* the five lattices are the five projects: each name opens its room */}
          <ul className="pointer-events-none absolute inset-0">
            {PROJECTS.map((p, i) => (
              <li key={p.id}>
                <button
                  ref={(el) => {
                    labels.current[i] = el;
                  }}
                  onClick={(e) => openRoom(p.id, e.currentTarget)}
                  tabIndex={(frame === 2 && active) || reduced ? 0 : -1}
                  className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-white/20 bg-plate/80 px-3 py-1 text-[13px] font-semibold text-plate-fg opacity-0 transition-colors hover:border-amber hover:text-amber md:px-3.5 md:py-1.5 md:text-[14px]"
                >
                  {p.t} →
                </button>
              </li>
            ))}
          </ul>


          {/* captions */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-plate via-plate/85 to-transparent p-5 pr-24 pt-20 md:bg-none md:p-10">
            <div className="relative min-h-[120px] max-w-[34ch] md:min-h-[150px]">
              {FRAMES.map((f, i) => {
                const on = reduced ? i === 2 : i === frame;
                return (
                  <div
                    key={f.note}
                    aria-hidden={!on}
                    className="absolute bottom-0 left-0 transition-[opacity,transform] duration-500 ease-out"
                    style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(12px)" }}
                  >
                    <p className="hand text-[24px] text-amber md:text-[28px]">{f.note}</p>
                    <p className="mt-1 font-display text-[clamp(24px,2.6vw,38px)] font-bold leading-[1.02] tracking-[-0.03em] text-plate-fg">{f.line}</p>
                    {f.sub && <p className="mt-3 text-[15px] font-medium text-plate-muted md:text-[17px]">{f.sub}</p>}
                    {i === 2 && (
                      <button
                        onClick={() => scrollToId("lab-start")}
                        tabIndex={on ? 0 : -1}
                        className={`mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-amber px-5 text-[15px] font-semibold text-plate transition-colors hover:bg-plate-fg ${on ? "pointer-events-auto" : ""}`}
                      >
                        See them all below ↓
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* controls */}
          <div className="absolute right-4 top-4 flex items-center gap-3 md:right-6 md:top-6">
            {!reduced && frame === 0 && <span className="hand hidden text-[22px] text-plate-muted sm:inline">scroll to play ↓</span>}
            <button
              onClick={() => scrollToId("lab-start")}
              tabIndex={frame === 2 && !reduced ? -1 : 0}
              style={{ opacity: frame === 2 && !reduced ? 0 : 1, pointerEvents: frame === 2 && !reduced ? "none" : undefined }}
              className="rounded-full border border-white/25 bg-plate/70 px-4 py-2 text-[14px] font-semibold text-plate-fg transition-[color,border-color,opacity] hover:border-amber hover:text-amber"
            >
              Skip to the projects ↓
            </button>
          </div>

          {/* scrub position */}
          {!reduced && (
            <div aria-hidden className="absolute inset-x-5 bottom-3 h-[3px] overflow-hidden rounded-full bg-white/10 md:inset-x-10 md:bottom-5">
              <div ref={bar} className="h-full origin-left rounded-full bg-amber" style={{ transform: "scaleX(0)" }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
