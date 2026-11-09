"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * A working, in-browser simulation of the Cyber Café dashboard's behaviour.
 * All numbers are SIMULATED demo data (seeded from the brief) — not real business figures.
 */
const RATE_PER_HOUR = 40; // ₹ — demo rate
const MIN_CHARGE = 20;
const PCS = 12;

type PC = { id: number; user: string | null; start: number | null };
type Log = { id: number; at: string; text: string; tone?: "in" | "out" };

const occupiedAtStart = [0, 2, 3, 4, 6, 8, 9, 11]; // 8 active users
const pad = (n: number) => String(n).padStart(2, "0");
const clock = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

export default function CyberCafe() {
  const [now, setNow] = useState(() => Date.now());
  const [pcs, setPcs] = useState<PC[]>(() => {
    const t = Date.now();
    return Array.from({ length: PCS }, (_, i) => {
      const on = occupiedAtStart.includes(i);
      return { id: i + 1, user: on ? `U-${140 + i * 3}` : null, start: on ? t - (8 + ((i * 37) % 90)) * 60_000 : null };
    });
  });
  const [sessions, setSessions] = useState(47);
  const [revenue, setRevenue] = useState(4280);
  const [log, setLog] = useState<Log[]>([{ id: 0, at: clock(), text: "Dashboard connected · 8 sessions live" }]);
  const [nextUser, setNextUser] = useState(201);
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const active = pcs.filter((p) => p.user).length;
  const load = Math.round((active / PCS) * 100);

  const toggle = (id: number) => {
    const pc = pcs.find((p) => p.id === id)!;
    setSel(id);
    if (pc.user && pc.start) {
      const mins = Math.max(1, Math.round((Date.now() - pc.start) / 60_000));
      const bill = Math.max(MIN_CHARGE, Math.ceil((mins / 60) * RATE_PER_HOUR));
      setRevenue((r) => r + bill);
      setPcs((all) => all.map((p) => (p.id === id ? { ...p, user: null, start: null } : p)));
      setLog((l) => [{ id: Date.now(), at: clock(), text: `PC-${pad(id)} · ${pc.user} ended · ${mins} min · ₹${bill}`, tone: "out" as const }, ...l].slice(0, 6));
    } else {
      const u = `U-${nextUser}`;
      setNextUser((n) => n + 1);
      setSessions((s) => s + 1);
      setPcs((all) => all.map((p) => (p.id === id ? { ...p, user: u, start: Date.now() } : p)));
      setLog((l) => [{ id: Date.now(), at: clock(), text: `PC-${pad(id)} allocated to ${u}`, tone: "in" as const }, ...l].slice(0, 6));
    }
  };

  const elapsed = (start: number) => {
    const s = Math.floor((now - start) / 1000);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  };

  const kpis = useMemo(
    () => [
      { k: "ACTIVE USERS", v: pad(active) },
      { k: "TODAY'S SESSIONS", v: String(sessions) },
      { k: "REVENUE", v: `₹${revenue.toLocaleString("en-IN")}` },
      { k: "LOAD", v: `${load}%` },
    ],
    [active, sessions, revenue, load]
  );

  return (
    <div className="overflow-hidden sheet rounded-[6px]">
      {/* app chrome */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-fg/20" />
            <span className="h-2 w-2 rounded-full bg-fg/20" />
            <span className="h-2 w-2 rounded-full bg-fg/20" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.06em]">
            CYBER CAFÉ <span className="text-dim">/</span> <span className="text-ok">● LIVE</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[11px] tracking-[0.06em] text-muted">SIMULATED DATA</span>
          <span className="hidden font-mono text-[11px] text-muted sm:inline" suppressHydrationWarning>
            {clock(new Date(now))}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="p-4 md:p-5">
          {/* KPIs */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.k} className="bg-ink px-4 py-3">
                <dt className="font-mono text-[11px] tracking-[0.06em] text-dim">{k.k}</dt>
                <dd className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.02em]">
                  <AnimatePresence mode="popLayout">
                    <motion.span key={k.v} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="inline-block">
                      {k.v}
                    </motion.span>
                  </AnimatePresence>
                </dd>
              </div>
            ))}
          </dl>

          {/* computers */}
          <div className="mb-3 mt-5 flex items-center justify-between">
            <p className="font-mono text-[11.5px] tracking-[0.06em] text-muted">COMPUTERS · CLICK TO ALLOCATE / END SESSION</p>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {pcs.map((p) => {
              const on = !!p.user;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => toggle(p.id)}
                    aria-label={`PC ${p.id}: ${on ? `occupied by ${p.user}. Activate to end session.` : "available. Activate to start a session."}`}
                    className={`group w-full rounded-lg border p-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      on ? "border-accent/40 bg-accent/[0.07]" : "border-line bg-ink hover:border-line-2"
                    } ${sel === p.id ? "ring-1 ring-accent-soft/60" : ""}`}
                  >
                    <span className="flex items-center justify-between font-mono text-[11.5px] tracking-[0.04em]">
                      <span className="text-fg">PC-{pad(p.id)}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-accent" : "bg-ok/80"}`} />
                    </span>
                    <span className={`mt-2 block font-mono text-[11px] tracking-[0.06em] ${on ? "text-accent-soft" : "text-ok/80"}`}>{on ? "OCCUPIED" : "AVAILABLE"}</span>
                    <span className="mt-0.5 block font-mono text-[11.5px] tabular-nums text-muted" suppressHydrationWarning>
                      {on && p.start ? elapsed(p.start) : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* usage log */}
        <aside className="border-t border-line p-4 md:border-l md:border-t-0 md:p-5" aria-label="Usage log">
          <p className="mb-3 font-mono text-[11.5px] tracking-[0.06em] text-muted">USAGE LOG</p>
          <ol className="space-y-2" aria-live="polite">
            <AnimatePresence initial={false}>
              {log.map((l) => (
                <motion.li key={l.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="rounded-md border border-line bg-ink px-2.5 py-2 font-mono text-[11.5px] leading-snug">
                  <span className="text-dim">{l.at}</span>
                  <span className={`mt-0.5 block ${l.tone === "in" ? "text-accent-soft" : l.tone === "out" ? "text-ok" : "text-muted"}`}>{l.text}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-dim">
            Demo billing: ₹{RATE_PER_HOUR}/hr · min ₹{MIN_CHARGE}. Real system: PHP + MySQL with auth, CRUD & reports.
          </p>
        </aside>
      </div>
    </div>
  );
}
