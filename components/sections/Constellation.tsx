"use client";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { tech } from "@/content/profile";
import SectionHead from "@/components/ui/SectionHead";
import { useInView, useIsLowPower, useWebGL } from "@/lib/hooks";
import type { NodeSpec } from "@/components/three/ConstellationScene";
import { ui } from "@/lib/store";

const DollCanvas = dynamic(() => import("@/components/three/DollCanvas"), { ssr: false });

const ConstellationScene = dynamic(() => import("@/components/three/ConstellationScene"), { ssr: false });

const groupName: Record<string, string> = { language: "Language", library: "Library", tool: "Tool", project: "Project stack" };

function fib(n: number, r: number, offset = 0): [number, number, number][] {
  const out: [number, number, number][] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = g * i + offset;
    out.push([Math.cos(th) * rad * r, y * r * 0.72, Math.sin(th) * rad * r]);
  }
  return out;
}

export default function Constellation() {
  const webgl = useWebGL();
  const low = useIsLowPower();
  const [ref, inView] = useInView<HTMLDivElement>("100px");
  const [sel, setSel] = useState(0);
  const selRef = useRef(0);
  const labels = useRef<(HTMLElement | null)[]>([]);
  const center = useRef<HTMLElement | null>(null);
  const wave = useRef(false);
  const look = useRef({ x: 0, y: 0 });

  const nodes: NodeSpec[] = useMemo(() => {
    const inner = tech.filter((t) => t.group !== "project");
    const outer = tech.filter((t) => t.group === "project");
    const ip = fib(inner.length, 2.35);
    const op = fib(outer.length, 3.25, 0.7);
    return [...inner.map((t, i) => ({ id: t.id, pos: ip[i], outer: false })), ...outer.map((t, i) => ({ id: t.id, pos: op[i], outer: true }))];
  }, []);
  const ordered = useMemo(() => nodes.map((n) => tech.find((t) => t.id === n.id)!), [nodes]);

  const choose = (i: number) => {
    setSel(i);
    selRef.current = i;
  };
  const cur = ordered[sel];
  const flat = webgl === false;

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative pb-16 pt-16 md:pb-20 md:pt-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead
          id="skills-title"
          index="02 / TECH CONSTELLATION"
          title={["The tools,", <span key="c" className="marker">connected.</span>]}
          kicker="Inner orbit: core skills. Outer orbit: the stacks each build ran on. Select any star to see where it was used."
        />

        <div data-build-group className="mt-16 grid gap-6 lg:grid-cols-[1fr_360px]">
          {low && (
            <div className="sheet rounded-[4px] p-5">
              {webgl && (
                <button onClick={() => ui.set({ assistantOpen: true })} aria-label="D-01, Dhanush's lab assistant — ask about his work" className="relative mx-auto mb-4 block h-[150px] w-[130px]">
                  <DollCanvas look={look} wave={wave} />
                </button>
              )}
              {(["language", "library", "tool", "project"] as const).map((g) => (
                <div key={g} className="mb-5 last:mb-0">
                  <p className="label mb-2 text-[11.5px]">{groupName[g]}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {ordered.map((t, i) =>
                      t.group === g ? (
                        <li key={t.id}>
                          <button
                            onClick={() => choose(i)}
                            aria-pressed={sel === i}
                            className={`rounded-full border px-3 py-1.5 text-[14px] font-medium transition-colors ${sel === i ? "border-accent bg-accent text-ink" : "border-line-2 text-fg"}`}
                          >
                            {t.label}
                          </button>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div ref={ref} hidden={low} data-build="canvas · tech map" className="plate relative h-[520px] rotate-[-0.4deg] overflow-hidden rounded-[6px] bg-[radial-gradient(ellipse_at_center,#25221a,var(--color-plate)_70%)] md:h-[640px]">
            {webgl && !low && <ConstellationScene nodes={nodes} labels={labels} center={center} selected={selRef} wave={wave} active={inView} low={low} />}

            {/* DOM labels — real, focusable buttons positioned by the 3D projection */}
            <div className="pointer-events-none absolute inset-0">
              {/* the doll at the centre is the way into the assistant */}
              <button
                ref={(el) => {
                  center.current = el;
                }}
                onClick={() => ui.set({ assistantOpen: true })}
                onPointerEnter={() => (wave.current = true)}
                onPointerLeave={() => (wave.current = false)}
                onFocus={() => (wave.current = true)}
                onBlur={() => (wave.current = false)}
                aria-label="D-01, Dhanush's lab assistant — ask about his work"
                className="group pointer-events-auto absolute left-0 top-0 flex h-[170px] w-[120px] items-end justify-center rounded-3xl"
                style={flat ? { left: "50%", top: "50%", transform: "translate(-50%,-50%)" } : undefined}
              >
                <span className="translate-y-6 rounded-full bg-amber px-2.5 py-0.5 text-[12px] font-semibold text-fg opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  ASK ME
                </span>
              </button>
              <ul aria-label="Technologies">
                {ordered.map((t, i) => {
                  const on = sel === i;
                  const a = (i / ordered.length) * Math.PI * 2;
                  const r = t.group === "project" ? 44 : 32;
                  return (
                    <li key={t.id}>
                      <button
                        ref={(el) => {
                          labels.current[i] = el;
                        }}
                        onClick={() => choose(i)}
                        onFocus={() => choose(i)}
                        aria-pressed={on}
                        className={`pointer-events-auto absolute left-0 top-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] font-medium transition-colors ${
                          on ? "border-amber bg-amber text-fg" : t.group === "project" ? "border-transparent text-plate-muted hover:text-plate-fg" : "border-white/15 bg-plate/70 text-plate-fg hover:border-amber/70"
                        }`}
                        style={flat ? { left: `${50 + Math.cos(a) * r}%`, top: `${50 + Math.sin(a) * r * 0.85}%`, transform: "translate(-50%,-50%)" } : { opacity: 0 }}
                      >
                        {t.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="pointer-events-none absolute bottom-4 left-5 text-[12px] font-medium text-plate-muted">
              {ordered.length} skills · {ordered.filter((t) => t.group !== "project").length} core · {ordered.filter((t) => t.group === "project").length} from project stacks
            </p>
          </div>

          {/* detail panel */}
          <aside data-stick data-build="panel · where used" aria-live="polite" className="sheet relative flex flex-col rounded-[4px] p-6">
            <span className="tape -top-3 right-8 rotate-[4deg]" />
            <AnimatePresence mode="wait">
              <motion.div key={cur.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                <p className="label text-accent">{groupName[cur.group]}</p>
                <h3 className="display mt-3 text-[clamp(36px,4vw,54px)]">{cur.label}</h3>
                <p className="hand mt-7 text-[24px]">where I used it, what I built</p>
                <ul className="mt-3 space-y-2.5">
                  {cur.used.map((u) => (
                    <li key={u} className="flex gap-3 text-[15px] leading-snug">
                      <span className="text-accent">→</span>
                      {u}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
            <div className="mt-auto flex gap-2 pt-10">
              <button onClick={() => choose((sel - 1 + ordered.length) % ordered.length)} className="h-11 flex-1 rounded-full border border-line-2 text-[15px] hover:border-accent hover:text-accent" aria-label="Previous technology">
                ←
              </button>
              <button onClick={() => choose((sel + 1) % ordered.length)} className="h-11 flex-1 rounded-full border border-line-2 text-[15px] hover:border-accent hover:text-accent" aria-label="Next technology">
                →
              </button>
            </div>
          </aside>
        </div>

      </div>
    </section>
  );
}
