"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { downloadResume } from "@/lib/resume";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "@/content/profile";
import { ui, useUI } from "@/lib/store";
import { lockScroll } from "@/lib/scroll";
import Tilt from "@/components/ui/Tilt";
import Magnetic from "@/components/ui/Magnetic";

const MIN = 1;
const MAX = 3.5;
const clampZ = (z: number) => Math.min(MAX, Math.max(MIN, Math.round(z * 100) / 100));

/**
 * The résumé as one sharp page you can zoom: buttons, double-click / double-tap on a spot,
 * ctrl/⌘ + wheel, pinch on touch screens, and +, − and 0 on the keyboard. Drag to move around.
 * It uses a high-resolution image of the PDF so it zooms the same way in every browser
 * (inline PDF viewers are missing on most phones and blocked inside embeds).
 */
function ResumeViewer() {
  const open = useUI((s) => s.resumeOpen);
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [base, setBase] = useState(800);
  // the point to keep still while zooming: fraction across the page + where it sits on screen
  const anchor = useRef<{ fx: number; fy: number; cx: number; cy: number } | null>(null);
  const drag = useRef<{ x: number; y: number; sl: number; st: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // zoom to `z`, keeping the page point under (cx, cy) in place; defaults to the middle of the view
  const zoomTo = useCallback((z: number, cx?: number, cy?: number) => {
    const b = box.current, i = img.current;
    if (!b || !i) return;
    const br = b.getBoundingClientRect(), ir = i.getBoundingClientRect();
    const x = cx ?? br.left + br.width / 2, y = cy ?? br.top + br.height / 2;
    anchor.current = {
      fx: Math.min(1, Math.max(0, (x - ir.left) / ir.width)),
      fy: Math.min(1, Math.max(0, (y - ir.top) / ir.height)),
      cx: x,
      cy: y,
    };
    setZoom(clampZ(z));
  }, []);

  useLayoutEffect(() => {
    const a = anchor.current, b = box.current, i = img.current;
    if (!a || !b || !i) return;
    anchor.current = null;
    const ir = i.getBoundingClientRect();
    b.scrollLeft += ir.left + a.fx * ir.width - a.cx;
    b.scrollTop += ir.top + a.fy * ir.height - a.cy;
  }, [zoom]);

  // fit the page to the width of the view (up to a comfortable reading width)
  useEffect(() => {
    if (!open) return;
    const fit = () => box.current && setBase(Math.min(box.current.clientWidth - 24, 860));
    fit();
    setZoom(1);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    btn.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") ui.set({ resumeOpen: false });
      else if (e.key === "+" || e.key === "=") zoomTo(zoomRef.current + 0.5);
      else if (e.key === "-" || e.key === "_") zoomTo(zoomRef.current - 0.5);
      else if (e.key === "0") zoomTo(1);
    };
    window.addEventListener("keydown", k);
    // ctrl/⌘ + wheel (and trackpad pinch, which arrives as ctrl + wheel) zooms the page, not the browser
    const b = box.current;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomTo(zoomRef.current * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
    };
    // two-finger pinch on touch screens; one finger keeps scrolling normally
    const mid = (t: TouchList) => [(t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2];
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const ts = (e: TouchEvent) => {
      if (e.touches.length === 2) pinch.current = { d: dist(e.touches), z: zoomRef.current };
    };
    const tm = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinch.current) return;
      e.preventDefault();
      const [x, y] = mid(e.touches);
      zoomTo(pinch.current.z * (dist(e.touches) / pinch.current.d), x, y);
    };
    const te = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch.current = null;
    };
    b?.addEventListener("wheel", wheel, { passive: false });
    b?.addEventListener("touchstart", ts, { passive: true });
    b?.addEventListener("touchmove", tm, { passive: false });
    b?.addEventListener("touchend", te);
    return () => {
      window.removeEventListener("keydown", k);
      b?.removeEventListener("wheel", wheel);
      b?.removeEventListener("touchstart", ts);
      b?.removeEventListener("touchmove", tm);
      b?.removeEventListener("touchend", te);
      lockScroll(false);
    };
  }, [open, zoomTo]);

  // mouse: drag to move around a zoomed page
  const lastType = useRef("mouse");
  const down = (e: React.PointerEvent) => {
    lastType.current = e.pointerType;
    if (e.pointerType !== "mouse" || !box.current) return;
    drag.current = { x: e.clientX, y: e.clientY, sl: box.current.scrollLeft, st: box.current.scrollTop, moved: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current, b = box.current;
    if (!d || !b) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    b.scrollLeft = d.sl - dx;
    b.scrollTop = d.st - dy;
  };
  const up = () => (drag.current = null);
  // touch: double-tap to zoom on a spot (the browser's own double-tap zoom is switched off here)
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const tap = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch" || pinch.current) return;
    const now = performance.now(), l = lastTap.current;
    if (now - l.t < 320 && Math.hypot(e.clientX - l.x, e.clientY - l.y) < 30) {
      zoomTo(zoomRef.current > 1.2 ? 1 : 2.2, e.clientX, e.clientY);
      lastTap.current = { t: 0, x: 0, y: 0 };
    } else lastTap.current = { t: now, x: e.clientX, y: e.clientY };
  };

  const ctl = "grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-ink-2 text-[18px] font-semibold hover:border-fg disabled:opacity-40";

  // rendered into <body> so no section's transform or stacking can sit on top of it
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-label="Resume" className="fixed inset-0 z-[98] flex flex-col bg-ink p-3 md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="mx-auto mb-3 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
            <span className="hand text-[26px]">résumé, one page</span>
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Zoom" className="flex items-center gap-1.5">
                <button className={ctl} onClick={() => zoomTo(zoom - 0.5)} disabled={zoom <= MIN} aria-label="Zoom out">−</button>
                <button onClick={() => zoomTo(1)} className="h-10 min-w-[64px] rounded-full border border-line-2 bg-ink-2 px-3 text-[14px] font-semibold tabular-nums hover:border-fg" aria-label="Fit to width">
                  {Math.round(zoom * 100)}%
                </button>
                <button className={ctl} onClick={() => zoomTo(zoom + 0.5)} disabled={zoom >= MAX} aria-label="Zoom in">+</button>
              </div>
              <a href={profile.resumePdf} download="Battu_Dhanush_Resume.pdf" onClick={downloadResume} className="h-10 rounded-full border border-line-2 bg-ink-2 px-4 text-[14px] font-semibold leading-10 hover:border-fg">
                Download PDF
              </a>
              <button ref={btn} onClick={() => ui.set({ resumeOpen: false })} className="h-10 rounded-full bg-fg px-4 text-[14px] font-semibold text-ink hover:bg-accent">
                Close ✕
              </button>
            </div>
          </div>
          <motion.div
            ref={box}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={(e) => {
              up();
              tap(e);
            }}
            onPointerLeave={up}
            data-lenis-prevent
            className={`mx-auto w-full max-w-5xl flex-1 overflow-auto overscroll-contain rounded-[4px] [touch-action:pan-x_pan-y] ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <div className="flex min-h-full min-w-full w-max items-start justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={img}
                src="img/resume-full.webp"
                alt="Resume of Battu Dhanush, one page"
                draggable={false}
                width={2479}
                height={3508}
                onDoubleClick={(e) => lastType.current !== "touch" && zoomTo(zoom > 1.2 ? 1 : 2.2, e.clientX, e.clientY)}
                style={{ width: base * zoom, maxWidth: "none" }}
                className="sheet block h-auto select-none rounded-[3px] bg-white"
              />
            </div>
          </motion.div>
          <p className="mt-2 text-center text-[13px] text-muted">
            <span className="hidden md:inline">Double-click to zoom in on a spot · ctrl/⌘ + scroll to zoom · drag to move</span>
            <span className="md:hidden">Double-tap or pinch to zoom</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default function Resume() {
  return (
    <section id="resume" aria-labelledby="resume-title" className="relative pb-10 pt-12 md:pb-14 md:pt-16">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 md:grid-cols-2 md:px-10">
        <div>
          <p data-write className="hand mb-3 flex items-center gap-2 text-[26px]">
            <svg data-draw viewBox="0 0 40 16" aria-hidden className="h-4 w-10 text-amber-ink"><path d="M2 10 C 10 4, 18 14, 26 8 S 34 6, 38 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            the record
          </p>
          <h2 id="resume-title" className="display text-[clamp(52px,8vw,124px)] outline-none">
            Résumé
          </h2>
          <dl className="mt-8 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line">
            {[
              ["Length", "One page"],
              ["Focus", "AI / ML"],
              ["Builds", "Software"],
              ["Depth", "Data"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink-2 px-4 py-3">
                <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-dim">{k}</dt>
                <dd className="mt-1 font-display text-[18px] font-bold text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic onClick={() => ui.set({ resumeOpen: true })} className="h-12 rounded-full bg-accent px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-fg">
              View résumé
            </Magnetic>
            <Magnetic as="a" href={profile.resumePdf} download="Battu_Dhanush_Resume.pdf" onClick={downloadResume} className="h-12 rounded-full border border-line-2 bg-ink-2/70 px-6 text-[15px] font-semibold transition-colors hover:border-fg">
              Download PDF
            </Magnetic>
          </div>
        </div>

        <div data-stick className="mx-auto w-full max-w-[440px]">
        <Tilt max={4} className="group mx-auto w-full max-w-[440px] rotate-[1.5deg] rounded-[3px]">
          <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-2deg]" />
          <button onClick={() => ui.set({ resumeOpen: true })} className="sheet relative block w-full overflow-hidden rounded-[3px] bg-white" aria-label="Open resume viewer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="img/resume-preview.webp" alt="" width={992} height={1403} className="block h-auto w-full" loading="lazy" />
            <span aria-hidden className="hand absolute bottom-4 right-4 rotate-[-6deg] rounded-full border-2 border-accent bg-ink-2/90 px-3 py-0.5 text-[22px] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">open it ↗</span>
          </button>
        </Tilt>
        </div>
      </div>
      <ResumeViewer />
    </section>
  );
}
