"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { iplViews } from "@/content/ipl";
import { ipl } from "@/content/profile";

/** Single-series bar charts (one hue, no legend), per-bar hover tooltip, table view for screen readers. */
export default function IplData() {
  const [tab, setTab] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const view = iplViews[tab];
  const max = Math.max(...view.data.map((d) => d.value));
  const columns = view.id === "seasons";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink-2/80">
      {/* DATA → ANALYSIS → INSIGHT → PREDICTION */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3 font-mono text-[11.5px] tracking-[0.06em] md:px-5">
        {["DATA", "ANALYSIS", "INSIGHT", "PREDICTION"].map((s, i) => (
          <span key={s} className="flex items-center gap-3">
            {i > 0 && <span className="text-accent">→</span>}
            <span className={i === 2 ? "text-fg" : "text-muted"}>{s}</span>
          </span>
        ))}
        <span className="ml-auto text-dim">1,095 MATCHES · 2008–2024</span>
      </div>

      <div className="p-4 md:p-6">
        <div role="tablist" aria-label="IPL views" className="flex flex-wrap gap-2">
          {iplViews.map((v, i) => (
            <button
              key={v.id}
              role="tab"
              id={`ipl-tab-${v.id}`}
              aria-selected={tab === i}
              aria-controls="ipl-panel"
              onClick={() => {
                setTab(i);
                setHover(null);
              }}
              className={`rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.06em] transition-colors ${
                tab === i ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:border-line-2 hover:text-fg"
              }`}
            >
              {v.tab}
            </button>
          ))}
        </div>

        <div id="ipl-panel" role="tabpanel" aria-labelledby={`ipl-tab-${view.id}`} className="mt-6">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="font-mono text-[11.5px] tracking-[0.06em] text-muted">{view.metric}</p>
            <p className="font-mono text-[11.5px] tracking-[0.06em] text-dim" aria-hidden>
              HOVER A BAR
            </p>
          </div>

          <AnimatePresence mode="wait">
            {columns ? (
              <motion.div key="cols" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="flex h-[240px] items-end gap-[2px]" aria-hidden onPointerLeave={() => setHover(null)}>
                  {view.data.map((d, i) => {
                    const on = hover === i;
                    return (
                      <div key={d.label} className="relative flex h-full flex-1 items-end" onPointerEnter={() => setHover(i)}>
                        <motion.div
                          className={`w-full rounded-t-[4px] ${on ? "bg-amber" : "bg-accent"}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.value / 80) * 100}%` }}
                          transition={{ duration: 0.9, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                          style={{ opacity: hover === null || on ? 1 : 0.45 }}
                        />
                        {on && (
                          <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-line-2 bg-ink px-2.5 py-1.5 font-mono text-[11.5px] leading-4 shadow-xl" style={{ bottom: `calc(${(d.value / 80) * 100}% + 8px)` }}>
                            <span className="text-fg">{d.label}</span> · {d.value} matches
                            {d.note && <span className="block text-muted">{d.note}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between border-t border-line pt-2 font-mono text-[11px] text-dim" aria-hidden>
                  <span>2008</span>
                  <span>2016</span>
                  <span>2024</span>
                </div>
              </motion.div>
            ) : (
              <motion.ul key={view.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-[6px]" aria-hidden onPointerLeave={() => setHover(null)}>
                {view.data.map((d, i) => {
                  const on = hover === i;
                  const showValue = i === 0 || on;
                  return (
                    <li key={d.label} className="grid grid-cols-[112px_1fr] items-center gap-3 py-1 md:grid-cols-[140px_1fr]" onPointerEnter={() => setHover(i)}>
                      <span className={`truncate text-[13px] ${on ? "text-fg" : "text-muted"}`}>{d.label}</span>
                      <span className="relative flex h-[22px] items-center">
                        <motion.span
                          className={`block h-full rounded-r-[4px] ${on ? "bg-amber" : "bg-accent"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.value / max) * 100}%` }}
                          transition={{ duration: 0.9, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          style={{ opacity: hover === null || on ? 1 : 0.45 }}
                        />
                        <span className={`ml-2 shrink-0 font-mono text-[11px] tabular-nums text-fg transition-opacity ${showValue ? "opacity-100" : "opacity-0"}`}>{d.value.toLocaleString("en-IN")}</span>
                      </span>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>

          {/* accessible table view */}
          <table className="sr-only">
            <caption>
              IPL {view.metric.toLowerCase()}, 2008 to 2024
            </caption>
            <thead>
              <tr>
                <th scope="col">{columns ? "Season" : "Name"}</th>
                <th scope="col">{view.metric}</th>
              </tr>
            </thead>
            <tbody>
              {view.data.map((d) => (
                <tr key={d.label}>
                  <td>{d.label}</td>
                  <td>
                    {d.value}
                    {d.note ? ` (${d.note})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <AnimatePresence mode="wait">
            <motion.p key={view.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 flex gap-3 border-t border-line pt-5 text-[15px] leading-relaxed">
              <span className="shrink-0 font-mono text-[11.5px] leading-6 tracking-[0.06em] text-accent-soft">INSIGHT</span>
              {view.insight}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-line px-4 py-4 md:px-6">
        <p className="mb-3 font-mono text-[11.5px] tracking-[0.06em] text-muted">PREDICTION PLATFORM · FLASK + SQLITE · 6 MODELS</p>
        <ul className="flex flex-wrap gap-2">
          {ipl.models.map((m) => (
            <li key={m} className="rounded-md border border-line px-2.5 py-1 font-mono text-[11.5px] tracking-[0.04em] text-fg/80">
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
