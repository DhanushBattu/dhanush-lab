"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ui } from "@/lib/store";

/**
 * "The site builds itself": a swarm of agent cursors, each with a name tag, flies in, drags a
 * wireframe box over a piece of the page, and that piece appears inside the box.
 *
 *  - [data-build-hero="label"]  built right after the loader (the opening screen)
 *  - [data-build-group] > [data-build="label"]  built when the group scrolls into view
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
  root.append(layer);
  const tl = gsap.timeline();
  const sx = window.scrollX, sy = window.scrollY;

  jobs.forEach((job, i) => {
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

export default function AgentBuild() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;z-index:84;pointer-events:none";
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
      // any input finishes the build at once
      const skip = () => {
        finishHero();
        window.removeEventListener("wheel", skip);
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("touchmove", skip);
      };
      window.addEventListener("wheel", skip, { passive: true });
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
      window.addEventListener("touchmove", skip, { passive: true });
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
      off();
      io.disconnect();
      timelines.forEach((t) => t.progress(1).kill());
      document.querySelectorAll<HTMLElement>("[data-build-hero],[data-build]").forEach((el) => gsap.set(el, { clipPath: "none" }));
      layer.remove();
    };
  }, []);

  return null;
}
