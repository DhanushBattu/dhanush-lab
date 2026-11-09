"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile, veriai } from "@/content/profile";

/**
 * VeriAI simulation. The pipeline stages and rules come from the résumé; the chat answer is a
 * made-up sample (clearly labelled) so visitors can watch claims get checked.
 */
type Verdict = "supported" | "wrong" | "fabricated";
type Claim = { text: string; verdict: Verdict; source: string; note: string; fix?: string };

const SAMPLE: Claim[] = [
  { text: "The Eiffel Tower stands in Paris.", verdict: "supported", source: "Wikipedia · Wikidata", note: "Quote found in the cited article." },
  {
    text: "It was completed in 1899.",
    verdict: "wrong",
    source: "Wikidata",
    note: "Evidence says 1889.",
    fix: "It was completed in 1889.",
  },
  {
    text: "Its design is explained in the paper “Iron Lattice Towers” (Eiffel, 1887).",
    verdict: "fabricated",
    source: "Crossref · OpenAlex",
    note: "No such paper exists in either index.",
  },
];

const tone: Record<Verdict, { chip: string; label: string }> = {
  supported: { chip: "border-ok/50 bg-ok/10 text-ok", label: "Supported" },
  wrong: { chip: "border-warn/50 bg-warn/10 text-warn", label: "Wrong" },
  fabricated: { chip: "border-amber-ink/50 bg-amber/20 text-amber-ink", label: "Fabricated source" },
};

export default function VeriAI() {
  const [stage, setStage] = useState(-1); // -1 idle, 0..4 running, 5 done
  const [sel, setSel] = useState(0);
  const [quoteRule, setQuoteRule] = useState(true);
  const timers = useRef<number[]>([]);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (reduced.current) {
      setStage(5);
      return;
    }
    setStage(0);
    for (let i = 1; i <= 5; i++) timers.current.push(window.setTimeout(() => setStage(i), i * 650));
  };

  const done = stage >= 5;
  const node = veriai.pipeline[Math.min(Math.max(stage, 0), 4)];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
      {/* ---------- chat + verdicts ---------- */}
      <div className="sheet rounded-[6px] p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="label">Chat · AI answer</p>
          <p className="text-[12px] font-medium text-dim">Sample answer, made up for this demo</p>
        </div>

        <div className="rounded-[4px] border border-line bg-ink p-4">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">You asked: tell me about the Eiffel Tower</p>
          <ol className="space-y-3">
            {SAMPLE.map((c, i) => {
              const show = done;
              const v = !quoteRule && c.verdict === "fabricated" ? null : c.verdict;
              return (
                <li key={c.text} className="text-[16px] leading-snug">
                  <span
                    className={`transition-colors duration-500 ${
                      stage >= 1 ? "underline decoration-2 underline-offset-[5px]" : ""
                    } ${show && v === "wrong" ? "decoration-warn line-through" : show && v === "fabricated" ? "decoration-amber" : show && v === "supported" ? "decoration-ok" : "decoration-line-2"}`}
                  >
                    {c.text}
                  </span>
                  <AnimatePresence>
                    {show && (
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.35 }}
                        className="mt-2 flex flex-wrap items-center gap-2 text-[13px]"
                      >
                        {v ? (
                          <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${tone[v].chip}`}>{tone[v].label}</span>
                        ) : (
                          <span className="rounded-full border border-warn/60 bg-warn/10 px-2.5 py-0.5 font-semibold text-warn">Accepted with no source</span>
                        )}
                        <span className="text-muted">{v ? `${c.source}: ${c.note}` : "The judge trusted itself. This is the failure VeriAI is built to stop."}</span>
                        {v === "wrong" && c.fix && <span className="w-full text-ok">Correction (re-checked): {c.fix}</span>}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={run} className="h-11 rounded-full bg-fg px-5 text-[14px] font-semibold text-ink transition-colors hover:bg-accent">
            {stage === -1 ? "▶ Verify this answer" : done ? "↻ Verify again" : "Checking…"}
          </button>
          <label className="flex cursor-pointer items-center gap-2 text-[14px] text-muted">
            <input type="checkbox" checked={quoteRule} onChange={(e) => setQuoteRule(e.target.checked)} className="h-4 w-4 accent-[var(--color-accent)]" />
            Require a cited quote for every verdict
          </label>
        </div>
      </div>

      {/* ---------- pipeline ---------- */}
      <div className="sheet flex flex-col rounded-[6px] p-5 md:p-6">
        <p className="label mb-4">Verification pipeline · tap a stage</p>
        <ol className="space-y-2">
          {veriai.pipeline.map((p, i) => {
            const active = stage === i;
            const passed = stage > i;
            const picked = stage === -1 && sel === i;
            return (
              <li key={p.id}>
                <button
                  onClick={() => {
                    setSel(i);
                    if (stage >= 5 || stage === -1) setStage(-1);
                  }}
                  aria-pressed={picked}
                  className={`flex w-full items-center gap-3 rounded-[4px] border px-3 py-2.5 text-left transition-colors duration-300 ${
                    active ? "border-accent bg-accent text-ink" : passed ? "border-accent/50 bg-accent/10" : picked ? "border-fg" : "border-line-2 hover:border-fg/60"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${active ? "bg-ink text-accent" : passed ? "bg-accent text-ink" : "bg-ink-3 text-muted"}`}>
                    {passed ? "✓" : i + 1}
                  </span>
                  <span className="text-[13px] font-semibold uppercase tracking-[0.04em]">{p.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div aria-live="polite" className="mt-4 min-h-[66px] border-t border-dashed border-line-2 pt-4 text-[15px] leading-relaxed">
          <AnimatePresence mode="wait">
            <motion.p key={stage === -1 ? `s${sel}` : `r${node.id}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {stage === -1 ? veriai.pipeline[sel].note : done ? "Every verdict above carries its source. Toggle the quote rule off to see what happens without it." : node.note}
            </motion.p>
          </AnimatePresence>
        </div>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {veriai.extras.map((x) => (
            <li key={x} className="rounded-full border border-line-2 px-2.5 py-1 text-[12.5px] font-medium text-fg">
              {x}
            </li>
          ))}
        </ul>
        <a href={profile.repos.veriai} target="_blank" rel="noopener noreferrer" className="mt-4 text-[14px] font-semibold text-accent underline underline-offset-4">
          View the code on GitHub ↗
        </a>
      </div>
    </div>
  );
}
