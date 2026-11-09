"use client";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { aboutMe } from "@/content/profile";
import SectionHead from "@/components/ui/SectionHead";
import Tilt from "@/components/ui/Tilt";

gsap.registerPlugin(DrawSVGPlugin);

/** Hovering a card redraws its doodle, like the pen going over it again. */
const redraw = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const paths = e.currentTarget.querySelectorAll("svg[data-draw] path:not([stroke-dasharray])");
  gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "power2.inOut", stagger: 0.06, overwrite: true });
};

/** Small pencil doodles, one per card. Paths are drawn on scroll by NotebookMotion ([data-draw]). */
const doodles: Record<(typeof aboutMe)[number]["id"], React.ReactNode> = {
  // two pins and the road between them
  roots: (
    <>
      <path d="M10 30 C 26 34, 30 10, 48 14 S 66 10, 70 8" strokeDasharray="3 4" />
      <path d="M10 30 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" />
      <path d="M70 8 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" />
    </>
  ),
  // two speech bubbles: a debate
  events: (
    <>
      <path d="M8 6 H36 Q40 6 40 10 V20 Q40 24 36 24 H18 L12 30 V24 H8 Q4 24 4 20 V10 Q4 6 8 6 Z" />
      <path d="M46 14 H72 Q76 14 76 18 V28 Q76 32 72 32 H68 V38 L62 32 H46 Q42 32 42 28 V18 Q42 14 46 14 Z" />
    </>
  ),
  // an inline skate: boot, frame, four wheels in a line
  play: (
    <>
      <path d="M14 22 V6 H30 L34 14 H52 Q60 14 60 22 Z" />
      <path d="M12 26 H62" />
      <path d="M18 32 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" />
      <path d="M30 32 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" />
      <path d="M42 32 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" />
      <path d="M54 32 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" />
    </>
  ),
  // a winding road under a crescent moon: night rides
  trips: (
    <>
      <path d="M4 36 C 22 36, 18 18, 38 20 S 58 10, 76 10" />
      <path d="M62 4 A6 6 0 1 0 72 12 A5 5 0 1 1 62 4 Z" />
    </>
  ),
};

const tilt = ["-0.8deg", "0.6deg", "0.5deg", "-0.6deg"];

/**
 * About me: four index cards between the hero and the scroll film.
 * The words are Dhanush's own (from content/profile.ts → aboutMe).
 */
export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative pb-16 pt-6 md:pb-24 md:pt-10">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead
          id="about-title"
          index="00 / ABOUT ME"
          title={["Off the", <span key="k" className="marker">keyboard.</span>]}
          kicker="Where I'm from, what I run, and what I do when I'm not building."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {aboutMe.map((c, i) => (
            <li key={c.id} data-stick style={{ rotate: tilt[i] }}>
              <Tilt max={5} className="group h-full rounded-[3px]">
              <article
                onPointerEnter={redraw}
                className="sheet relative flex h-full flex-col rounded-[3px] px-5 pb-5 pt-6 transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_40px_-24px_rgba(40,30,15,.55)]"
              >
                {i % 2 === 0 && <span className="tape -top-3 left-8 rotate-[-4deg]" />}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
                    0{i + 1} · {c.tag}
                  </p>
                  <svg
                    data-draw
                    viewBox="0 0 80 40"
                    aria-hidden
                    className="-mr-1 -mt-1 h-10 w-20 shrink-0 text-amber-ink"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {doodles[c.id]}
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em]">{c.title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{c.body}</p>
                <p className="hand mt-5 text-[24px] leading-none text-amber-ink">
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_2px]">
                    {c.hand}
                  </span>
                </p>
              </article>
              </Tilt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
