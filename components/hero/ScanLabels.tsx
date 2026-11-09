"use client";
import { useEffect, useRef } from "react";
import { scanAt } from "@/lib/scan";

// positions in portrait space (0..1, top-down) — placed on the digital side of the face
const LABELS = [
  { x: 0.7, y: 0.12, t: "Identity" },
  { x: 0.7, y: 0.15, t: "Battu Dhanush", strong: true },
  { x: 0.72, y: 0.3, t: "Online" },
  { x: 0.76, y: 0.43, t: "AI/ML" },
  { x: 0.74, y: 0.54, t: "Building" },
  { x: 0.7, y: 0.66, t: "Experimenting" },
];

export default function ScanLabels({ bootAt, hovering, animated }: { bootAt: number; hovering: boolean; animated: boolean }) {
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const line = useRef<HTMLDivElement>(null);
  const hits = useRef<number[]>(LABELS.map(() => -99));
  const hoverRef = useRef(hovering);
  hoverRef.current = hovering;

  useEffect(() => {
    if (!animated) return;
    let raf = 0;
    const loop = () => {
      const since = (performance.now() - bootAt) / 1000;
      const s = scanAt(since);
      if (line.current) {
        line.current.style.opacity = s < 0 ? "0" : "1";
        line.current.style.top = `${Math.max(0, s) * 100}%`;
      }
      LABELS.forEach((l, i) => {
        if (s >= 0 && Math.abs(s - l.y) < 0.03) hits.current[i] = since;
        const fade = Math.max(0, 1 - (since - hits.current[i]) / 2.2);
        const o = Math.max(fade, hoverRef.current ? 0.55 : 0);
        const el = els.current[i];
        if (el) {
          el.style.opacity = o.toFixed(3);
          el.style.transform = `translateX(${(1 - Math.min(1, o * 1.4)) * -6}px)`;
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animated, bootAt]);

  return (
    <div className="pointer-events-none absolute inset-0 select-none text-[12px] font-semibold tracking-[0.04em]">
      {/* thin HTML scan line — the WebGL band sits exactly beneath it */}
      {animated && (
        <div ref={line} className="absolute left-[8%] right-[4%] h-px opacity-0" style={{ background: "linear-gradient(90deg, transparent, rgba(240,160,56,.55) 45%, rgba(244,180,92,.95) 70%, transparent)" }} />
      )}

      {LABELS.map((l, i) => (
        <span
          key={l.t}
          ref={(el) => {
            els.current[i] = el;
          }}
          className={`absolute hidden items-center gap-2 whitespace-nowrap md:flex ${l.strong ? "text-amber" : "text-plate-fg/75"}`}
          style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%`, opacity: animated ? 0 : 0.45 }}
        >
          <span className="inline-block h-px w-4 bg-current opacity-60" />
          {l.t}
        </span>
      ))}

      {/* face bracket + readout on hover */}
      <div
        className="absolute transition-opacity duration-500"
        style={{ left: "24%", top: "22%", width: "48%", height: "62%", opacity: hovering ? 1 : 0 }}
      >
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((c) => (
          <span key={c} className={`absolute h-3 w-3 border-amber/80 ${c}`} />
        ))}
        <span className="absolute -bottom-6 left-0 text-[12px] font-semibold text-amber">Scan locked</span>
      </div>
    </div>
  );
}
