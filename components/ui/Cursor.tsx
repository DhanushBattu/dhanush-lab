"use client";
import { useEffect, useRef } from "react";

/**
 * Custom cursor (fine pointers only): a dot + a lagging ring that grows over interactive
 * elements. Also feeds --mx/--my so the page light follows the cursor.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    if (!fine) return;
    if (!reduced) root.classList.add("has-cursor");

    let x = innerWidth / 2,
      y = innerHeight / 2,
      rx = x,
      ry = y,
      raf = 0,
      hover = false,
      dark = false;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);
      const t = e.target as HTMLElement | null;
      hover = !!t?.closest("a, button, [role='button'], input, textarea, select, [data-cursor]");
      // over dark screens (the film, the skills map, the assistant) the cursor turns light
      dark = !!t?.closest(".plate, .bg-plate, [data-dark]");
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${hover ? 1.8 : 1})`;
        ring.current.style.borderColor = dark
          ? hover
            ? "rgba(240,160,56,.95)"
            : "rgba(236,230,216,.7)"
          : hover
            ? "rgba(14,107,91,.75)"
            : "rgba(28,26,22,.35)";
      }
      if (dot.current) dot.current.style.backgroundColor = dark ? (hover ? "#f0a038" : "#ece6d8") : "";
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    if (!reduced) raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden [@media(hover:hover)_and_(pointer:fine)]:block motion-reduce:!hidden">
      <div ref={dot} className="absolute -left-[2px] -top-[2px] h-1 w-1 rounded-full bg-fg" />
      <div
        ref={ring}
        className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-[1.5px] transition-[border-color] duration-200"
        style={{ transitionProperty: "border-color", willChange: "transform" }}
      />
    </div>
  );
}
