"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ui } from "@/lib/store";
import { getLenis } from "@/lib/scroll";

/**
 * "The site builds itself": a swarm of agent cursors, each with a name tag, flies in, drags a
 * wireframe box over a piece of the page, and that piece appears inside the box.
 *
 *  - [data-build-hero="label"]  built right after the loader (the opening screen)
 *  - [data-build-group] > [data-build="label"]  built when the group scrolls into view
 *
 * Once the opening screen is built, the page scrolls itself from top to bottom (the "tour"),
 * so the agents can be watched building each section, and stops at the bottom. Scrolling
 * yourself (wheel, swipe or scroll keys), the Stop button, or opening a project, the résumé or
 * the assistant hands control straight back. Every visit starts at the top.
 *
 * Pieces are hidden with clip-path only (never removed from the page), so screen readers and
 * search engines always see the full content. Skipped entirely for reduced motion.
 */

const AGENTS = [
  { name: "layout-agent", color: "#0e6b5b" },
  { name: "type-agent", color: "#d9772b" },
  { name: "copy-agent", color: "#a64b33" },
  { name: "ui-agent", color: "#2a7448" },
  { name: "photo-agent", color: "#c2417a" },
  { name: "motion-agent", color: "#3d8fb0" },
  { name: "a11y-agent", color: "#7c5cc4" },
  { name: "data-agent", color: "#b8902a" },
];

const HIDDEN = "inset(0% 100% 0% 0%)";
const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End", "Escape"]);

function cursorEl(name: string, color: string) {
  const c = document.createElement("div");
  c.style.cssText = "position:absolute;left:0;top:0;will-change:transform;opacity:0";
  c.innerHTML = `
    <svg width="16" height="20" viewBox="0 0 16 20" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))">
      <path d="M1 1 L1 16 L5 12.4 L8 18.6 L10.6 17.4 L7.7 11.4 L13.4 11.4 Z" fill="${color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>
    <span style="position:absolute;left:13px;top:15px;white-space:nowrap;border-radius:999px;background:${color};color:#fff;
      font:600 10.5px/1 var(--font-sans),system-ui,sans-serif;padding:4px 7px;letter-spacing:.01em;box-shadow:0 4px 10px -4px rgba(0,0,0,.35)">${name}</span>`;
  return c;
}

function boxEl(label: string, color: string) {
  const b = document.createElement("div");
  b.style.cssText = `position:absolute;left:0;top:0;width:0;height:0;border:1.5px solid ${color};background:${color}14;border-radius:3px;opacity:0`;
  const handle = (pos: string) => `<i style="position:absolute;${pos};width:7px;height:7px;background:#fff;border:1.5px solid ${color};border-radius:1px"></i>`;
  b.innerHTML = `
    ${handle("left:-4.5px;top:-4.5px")}${handle("right:-4.5px;top:-4.5px")}${handle("left:-4.5px;bottom:-4.5px")}${handle("right:-4.5px;bottom:-4.5px")}
    <span data-tag style="position:absolute;left:-1.5px;bottom:100%;margin-bottom:5px;white-space:nowrap;border-radius:3px;background:${color};color:#fff;
      font:600 10.5px/1 var(--font-code),ui-monospace,monospace;padding:3px 6px">${label}</span>
    <span data-dim style="position:absolute;right:-1.5px;top:100%;margin-top:5px;white-space:nowrap;border-radius:3px;background:#17150f;color:#ece6d8;
      font:500 10px/1 var(--font-code),ui-monospace,monospace;padding:3px 6px">0 × 0</span>`;
  return b;
}

type Job = { el: HTMLElement; label: string };
let nextAgent = 0;

/** Build one batch of pieces. `from` is where the swarm comes from (page coordinates). */
function build(root: HTMLElement, jobs: Job[], opts: { from: { x: number; y: number }; stagger: number; guides?: { top: number; height: number } }) {
  // each batch draws on its own sheet, removed when the batch is done
  const layer = document.createElement("div");
  root.style.height = `${document.documentElement.scrollHeight}px`;
  root.append(layer);
  const tl = gsap.timeline();
  const sx = window.scrollX, sy = window.scrollY;

  // pieces that aren't on the page right now (e.g. hidden on phones) are just shown
  const visible = jobs.filter((j) => {
    const r = j.el.getBoundingClientRect();
    if (r.width > 2 && r.height > 2) return true;
    gsap.set(j.el, { clipPath: "none" });
    return false;
  });

  visible.forEach((job, i) => {
    const agent = AGENTS[nextAgent++ % AGENTS.length];
    const r = job.el.getBoundingClientRect();
    const x = r.left + sx, y = r.top + sy, w = r.width, h = r.height;
    const cur = cursorEl(agent.name, agent.color);
    const box = boxEl(job.label, agent.color);
    layer.append(box, cur);
    const dim = box.querySelector<HTMLElement>("[data-dim]")!;
    const size = { w: 0, h: 0 };

    // swarm: start bunched up, a little scattered
    const startX = opts.from.x + gsap.utils.random(-70, 70);
    const startY = opts.from.y + gsap.utils.random(-50, 50);
    const t0 = i * opts.stagger;
    gsap.set(cur, { x: startX, y: startY });
    gsap.set(box, { x, y });

    // each piece runs on its own little timeline, all of them overlapping
    const jt = gsap.timeline();
    jt.to(cur, { opacity: 1, duration: 0.2 }, 0)
      // fly to the piece's top-left corner
      .to(cur, { x: x - 2, y: y - 2, duration: gsap.utils.random(0.55, 0.8), ease: "power3.inOut" }, 0)
      // drag out the box
      .set(box, { opacity: 1 })
      .to(cur, { x: x + w - 2, y: y + h - 2, duration: 0.55, ease: "power2.inOut" })
      .to(box, { width: w, height: h, duration: 0.55, ease: "power2.inOut" }, "<")
      .to(size, { w, h, duration: 0.55, ease: "power2.inOut", onUpdate: () => (dim.textContent = `${Math.round(size.w)} × ${Math.round(size.h)}`) }, "<")
      // the piece appears inside it
      .to(job.el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.out" }, ">-0.05")
      .to(box, { backgroundColor: `${agent.color}00`, duration: 0.5 }, "<")
      // clean up and fly off
      .to(box, { opacity: 0, duration: 0.35 }, ">+0.15")
      .to(cur, { x: `+=${gsap.utils.random(-160, 160)}`, y: `-=${gsap.utils.random(80, 180)}`, opacity: 0, duration: 0.6, ease: "power2.in" }, "<");
    tl.add(jt, t0);

    // faint layout guides from each piece's left edge, like a design tool's
    if (opts.guides) {
      const g = document.createElement("div");
      g.style.cssText = `position:absolute;left:${x}px;top:${opts.guides.top}px;width:1px;height:${opts.guides.height}px;background:${agent.color}55;transform-origin:top;transform:scaleY(0)`;
      layer.append(g);
      tl.to(g, { scaleY: 1, duration: 0.7, ease: "power2.out" }, t0 + 0.4).to(g, { opacity: 0, duration: 0.6 }, ">+0.8");
    }
  });

  tl.eventCallback("onComplete", () => {
    jobs.forEach((j) => gsap.set(j.el, { clipPath: "none" }));
    layer.remove();
  });
  return tl;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function AgentBuild() {
  const [touring, setTouring] = useState(false);
  const stopTour = useRef<() => void>(() => {});

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    // full page size and clipped, so cursors flying off the edge never make the page scroll sideways (phones)
    layer.style.cssText = "position:absolute;left:0;top:0;width:100%;height:0;overflow:hidden;z-index:84;pointer-events:none";
    document.body.appendChild(layer);

    const timelines: gsap.core.Timeline[] = [];

    // ---------- the opening screen, right after the loader ----------
    const heroJobs: Job[] = Array.from(document.querySelectorAll<HTMLElement>("[data-build-hero]")).map((el) => ({ el, label: el.dataset.buildHero || "" }));
    heroJobs.forEach((j) => gsap.set(j.el, { clipPath: HIDDEN }));
    let heroTl: gsap.core.Timeline | null = null;
    const finishHero = () => heroTl && heroTl.progress() < 1 && heroTl.progress(1);
    const startHero = () => {
      if (heroTl || !heroJobs.length) return;
      const hero = document.getElementById("top");
      heroTl = build(layer, heroJobs, {
        from: { x: window.innerWidth * 0.5, y: window.scrollY + window.innerHeight * 0.55 },
        stagger: 0.16,
        guides: hero ? { top: hero.offsetTop, height: hero.offsetHeight } : undefined,
      });
      timelines.push(heroTl);
      // when the opening screen is done, take the visitor on the tour
      heroTl.call(() => {
        if (!tookOver) setTimeout(startTour, 500);
      });
      // scrolling yourself finishes the build at once (and means the visitor wants control)
      const skip = () => {
        tookOver = true;
        finishHero();
        window.removeEventListener("wheel", skip);
        window.removeEventListener("keydown", skipKey);
        window.removeEventListener("touchmove", skip);
      };
      const skipKey = (e: KeyboardEvent) => SCROLL_KEYS.has(e.key) && skip();
      window.addEventListener("wheel", skip, { passive: true });
      window.addEventListener("keydown", skipKey);
      window.addEventListener("touchmove", skip, { passive: true });
    };
    // ---------- the tour: scroll top to bottom, pausing while each section is built ----------
    let tookOver = false;
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    const glide = (to: number, speed: number) =>
      new Promise<void>((res) => {
        const lenis = getLenis();
        if (!lenis || cancelled) return res();
        const dist = Math.abs(to - window.scrollY);
        lenis.scrollTo(to, { duration: Math.max(1.1, dist / speed), easing: easeInOut, force: true, onComplete: () => res() });
        // resolve anyway if something else interrupts the scroll
        setTimeout(res, (Math.max(1.1, dist / speed) + 0.6) * 1000);
      });
    const top = (id: string, offset = 90) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY - offset : null;
    };
    const startTour = async () => {
      if (tookOver || !getLenis()) return;
      setTouring(true);
      // only a deliberate scroll (or opening a project, the résumé or the assistant) takes over;
      // a stray click or tap doesn't
      const onKey = (e: KeyboardEvent) => SCROLL_KEYS.has(e.key) && stop();
      const unsub = ui.subscribe(() => {
        const st = ui.get();
        if (st.room || st.resumeOpen || st.assistantOpen) stop();
      });
      const stop = () => {
        if (cancelled) return;
        cancelled = true;
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchmove", stop);
        window.removeEventListener("keydown", onKey);
        unsub();
        getLenis()?.scrollTo(window.scrollY, { immediate: true, force: true });
        setTouring(false);
      };
      stopTour.current = stop;
      window.addEventListener("wheel", stop, { passive: true });
      window.addEventListener("touchmove", stop, { passive: true });
      window.addEventListener("keydown", onKey);

      const film = document.getElementById("film");
      const steps: { to: () => number | null; speed: number; pause: number }[] = [
        { to: () => top("about", 70), speed: 1100, pause: 2600 },
        { to: () => (film ? film.offsetTop : null), speed: 1100, pause: 600 },
        // the scroll film plays slowly, frame by frame
        { to: () => (film ? film.offsetTop + film.offsetHeight - window.innerHeight : null), speed: 520, pause: 1600 },
        { to: () => top("lab-start", 110), speed: 1000, pause: 2900 },
        { to: () => top("skills", 70), speed: 1100, pause: 2600 },
        { to: () => top("education", 70), speed: 1100, pause: 2200 },
        { to: () => top("resume", 70), speed: 1100, pause: 2200 },
        { to: () => document.documentElement.scrollHeight - window.innerHeight, speed: 1100, pause: 0 },
      ];
      for (const s of steps) {
        if (cancelled) return;
        const to = s.to();
        if (to === null) continue;
        await glide(Math.max(0, to), s.speed);
        if (cancelled) return;
        await wait(s.pause);
      }
      if (!cancelled) {
        stop();
      }
    };

    // the loader announces itself with `booted`; give it a beat to fade
    let off = () => {};
    if (ui.get().booted) startHero();
    else
      off = ui.subscribe(() => {
        if (ui.get().booted) {
          off();
          setTimeout(startHero, 250);
        }
      });

    // ---------- sections, built as they come into view ----------
    const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-build-group]"));
    const pending = new Map<HTMLElement, Job[]>();
    groups.forEach((g) => {
      const jobs = Array.from(g.querySelectorAll<HTMLElement>("[data-build]")).map((el) => ({ el, label: el.dataset.build || "" }));
      jobs.forEach((j) => gsap.set(j.el, { clipPath: HIDDEN }));
      pending.set(g, jobs);
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const g = e.target as HTMLElement;
          const jobs = pending.get(g);
          if (!jobs) return;
          pending.delete(g);
          io.unobserve(g);
          const r = g.getBoundingClientRect();
          // the swarm comes in from just off-screen, at the side nearest the group's start
          const fromLeft = r.left + r.width / 2 > window.innerWidth / 2;
          timelines.push(
            build(layer, jobs, {
              from: { x: fromLeft ? -40 : window.innerWidth + 40, y: window.scrollY + r.top + Math.min(r.height, window.innerHeight) * 0.4 },
              stagger: 0.12,
            }),
          );
        }),
      { threshold: 0.18 },
    );
    groups.forEach((g) => io.observe(g));

    return () => {
      cancelled = true;
      stopTour.current();
      off();
      io.disconnect();
      timelines.forEach((t) => t.progress(1).kill());
      document.querySelectorAll<HTMLElement>("[data-build-hero],[data-build]").forEach((el) => gsap.set(el, { clipPath: "none" }));
      layer.remove();
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-4 left-4 z-[86] flex items-center gap-3 rounded-full bg-plate py-2 pl-4 pr-2 text-[13px] text-plate-fg shadow-[0_14px_30px_-14px_rgba(0,0,0,.6)] transition-[opacity,transform] duration-500 md:bottom-6 md:left-6 ${
        touring ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {touring && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
          </span>
          <span>
            <span className="font-semibold">Agents are building the lab</span>
            <span className="hidden text-plate-muted sm:inline"> · scroll to take over</span>
          </span>
          <button onClick={() => stopTour.current()} className="rounded-full border border-white/20 px-3 py-1 text-[12px] font-semibold hover:border-amber hover:text-amber">
            Stop
          </button>
        </>
      )}
    </div>
  );
}
