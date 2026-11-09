"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience } from "@/content/profile";
import Counter from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";

/** Room 01 — the real-world AI automation pipeline, its measured impact, and what was built. */
export default function ExperienceDemo() {
  const [active, setActive] = useState(0);
  const stage = experience.pipeline[active];

  return (
    <div>
        {/* ---------- pipeline ---------- */}
        <Reveal>
          <div className="brackets rounded-2xl border border-line bg-ink-2/60 p-5 md:p-8">
            <div className="mb-8 flex items-center justify-between">
              <p className="label">PIPELINE · HOVER OR TAP A STAGE</p>
              <p className="label hidden text-dim md:block">CAMPAIGN → USER</p>
            </div>

            <ol className="relative grid gap-3 md:grid-cols-6 md:gap-0">
              {/* connector + travelling packet (desktop) */}
              <div aria-hidden className="absolute left-[8%] right-[8%] top-[27px] hidden h-px bg-line-2 md:block">
                <span className="absolute -top-[2px] h-[5px] w-10 rounded-full bg-accent/80 blur-[1px] [animation:packet_4.8s_linear_infinite]" />
              </div>
              {experience.pipeline.map((p, i) => {
                const on = i === active;
                return (
                  <li key={p.id} className="relative flex md:flex-col md:items-center">
                    <button
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-pressed={on}
                      aria-describedby="pipeline-note"
                      className="group flex w-full items-center gap-4 rounded-xl p-2 text-left md:flex-col md:gap-3 md:text-center"
                    >
                      <span
                        className={`relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border font-mono text-[11.5px] transition-all duration-300 ${
                          on ? "border-accent bg-accent text-ink" : "border-line-2 bg-ink-2 text-muted group-hover:border-accent/60"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={`font-mono text-[11px] tracking-[0.06em] transition-colors ${on ? "text-fg" : "text-muted"}`}>{p.label}</span>
                    </button>
                    {i < experience.pipeline.length - 1 && <span aria-hidden className="absolute left-[27px] top-[46px] h-4 w-px bg-line-2 md:hidden" />}
                  </li>
                );
              })}
            </ol>

            <div id="pipeline-note" aria-live="polite" className="mt-8 min-h-[64px] border-t border-line pt-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stage.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-2xl text-[17px] leading-relaxed md:text-[19px]"
                >
                  <span className="mr-3 font-mono text-[11px] tracking-[0.06em] text-accent-soft">{stage.label}</span>
                  {stage.note}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {experience.impact.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.08} className="bg-ink p-8 md:p-10">
            <p className="display text-[clamp(48px,5vw,88px)]">
              <span className="text-accent">+</span>
              <Counter to={m.value} suffix="%" />
            </p>
            <p className="label mt-4">{m.label}</p>
          </Reveal>
        ))}
      </div>

      <ul className="mt-10 grid gap-x-10 gap-y-3 md:grid-cols-2">
        {experience.points.map((p) => (
          <li key={p} className="flex gap-3 text-[14px] leading-relaxed text-muted">
            <span className="mt-[9px] h-px w-3 shrink-0 bg-accent" />
            {p}
          </li>
        ))}
      </ul>

      <style>{`@keyframes packet{0%{left:0%;opacity:0}8%{opacity:1}92%{opacity:1}100%{left:calc(100% - 2.5rem);opacity:0}}`}</style>
    </div>
  );
}
