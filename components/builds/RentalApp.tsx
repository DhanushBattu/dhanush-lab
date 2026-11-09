"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { rental } from "@/content/profile";

type Phase = "idle" | "request" | "commit" | "done";
type LogLine = { t: string; tone?: "ok" | "bad" | "dim" };

/* ---------- Architecture: clickable nodes on a tilted board ---------- */
function Architecture() {
  const [sel, setSel] = useState(0);
  const node = rental.flow[sel];
  return (
    <div className="brackets rounded-2xl border border-line bg-ink-2/70 p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="label">ARCHITECTURE · TAP A NODE</p>
        <p className="label text-dim">{String(sel + 1).padStart(2, "0")} / 07</p>
      </div>
      <div className="[perspective:1100px]">
        <ol className="grid grid-cols-1 gap-2 transition-transform duration-700 [transform:rotateX(14deg)] hover:[transform:rotateX(0deg)] sm:grid-cols-7 sm:gap-0">
          {rental.flow.map((f, i) => {
            const on = i === sel;
            const passed = i < sel;
            return (
              <li key={f.id} className="relative flex items-center sm:flex-col">
                {i > 0 && (
                  <span aria-hidden className={`absolute hidden h-px sm:block sm:left-0 sm:right-1/2 sm:top-[19px] ${passed || on ? "bg-accent" : "bg-line-2"}`} />
                )}
                {i < rental.flow.length - 1 && (
                  <span aria-hidden className={`absolute hidden h-px sm:block sm:left-1/2 sm:right-0 sm:top-[19px] ${passed ? "bg-accent" : "bg-line-2"}`} />
                )}
                <button
                  onClick={() => setSel(i)}
                  aria-pressed={on}
                  className="relative z-10 flex w-full items-center gap-3 rounded-lg p-1.5 text-left sm:flex-col sm:gap-2 sm:text-center"
                >
                  <span
                    className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md border font-mono text-[11.5px] transition-all duration-300 ${
                      on ? "border-accent bg-accent text-ink" : passed ? "border-accent/60 bg-ink-2 text-accent" : "border-line-2 bg-ink-2 text-muted hover:border-accent/60"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`font-mono text-[11.5px] leading-tight tracking-[0.06em] ${on ? "text-fg" : "text-muted"}`}>{f.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div aria-live="polite" className="mt-6 min-h-[72px] border-t border-line pt-5">
        <AnimatePresence mode="wait">
          <motion.p key={node.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-[15px] leading-relaxed">
            <span className="mr-2 font-mono text-[11px] tracking-[0.06em] text-accent-soft">{node.label}</span>
            {node.note}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Double-booking simulation ---------- */
function DoubleBooking() {
  const [rules, setRules] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<LogLine[]>([{ t: "> ready · item #42 status = AVAILABLE", tone: "dim" }]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    setPhase("request");
    setLog([{ t: "> USER A · book(item #42, 12–14 Oct)" }, { t: "> USER B · book(item #42, 12–14 Oct)" }]);
    at(900, () => {
      setPhase("commit");
      setLog((l) => [
        ...l,
        rules ? { t: "  txn A · read #42 = AVAILABLE → write BOOKED(A) · COMMIT" } : { t: "  A reads #42 = AVAILABLE · writes BOOKED(A)" },
        rules ? { t: "  txn B · conflict detected → retry · read #42 = BOOKED" } : { t: "  B reads #42 = AVAILABLE · writes BOOKED(B)" },
      ]);
    });
    at(1900, () => {
      setPhase("done");
      setLog((l) => [
        ...l,
        rules
          ? { t: "✓ A confirmed · B rejected: item unavailable", tone: "ok" }
          : { t: "✕ DOUBLE-BOOKED — two confirmations for one item", tone: "bad" },
      ]);
    });
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setPhase("idle");
    setLog([{ t: "> ready · item #42 status = AVAILABLE", tone: "dim" }]);
  };

  const flying = phase === "request";
  const ok = rules;
  const users = ["A", "B"];

  return (
    <div className="brackets rounded-2xl border border-line bg-ink-2/70 p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="label">SIMULATION · DOUBLE-BOOKING</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11.5px] tracking-[0.06em] text-muted">TRANSACTION RULES</span>
          <button
            role="switch"
            aria-checked={rules}
            onClick={() => {
              setRules((r) => !r);
              reset();
            }}
            className={`relative h-6 w-11 rounded-full border transition-colors ${rules ? "border-accent bg-accent/30" : "border-line-2 bg-ink"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-fg transition-all ${rules ? "left-[22px]" : "left-0.5"}`} />
            <span className="sr-only">Toggle transaction rules</span>
          </button>
          <span className={`w-7 font-mono text-[11.5px] ${rules ? "text-accent-soft" : "text-warn"}`}>{rules ? "ON" : "OFF"}</span>
        </div>
      </div>

      {/* diagram */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4">
        <div className="space-y-6">
          {users.map((u, i) => {
            const rejected = phase === "done" && ok && u === "B";
            return (
              <div key={u} className={`relative rounded-lg border px-3 py-2.5 font-mono text-[11px] tracking-[0.06em] transition-colors ${rejected ? "border-warn/50 text-warn" : phase === "done" ? "border-ok/40 text-ok" : "border-line-2 text-fg"}`}>
                USER {u}
                <span className="block text-[11px] text-dim">{rejected ? "REJECTED" : phase === "done" ? "CONFIRMED" : "BOOK #42"}</span>
                {flying && (
                  <motion.span
                    aria-hidden
                    className="absolute top-1/2 h-1.5 w-1.5 rounded-full bg-amber"
                    initial={{ left: "100%", y: 0 }}
                    animate={{ left: "175%", y: i === 0 ? 30 : -30 }}
                    transition={{ duration: 0.8, ease: "easeIn" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`rounded-lg border px-4 py-5 text-center font-mono text-[11.5px] tracking-[0.06em] transition-all duration-500 ${
              phase === "commit" ? "border-accent bg-accent/10" : "border-line-2"
            }`}
          >
            {ok ? "DATABASE" : "NAIVE"}
            <br />
            {ok ? "TRANSACTION" : "WRITE"}
          </div>
        </div>

        <div
          className={`rounded-lg border px-3 py-3 text-center font-mono text-[11px] tracking-[0.06em] transition-colors duration-500 ${
            phase !== "done" ? "border-line-2" : ok ? "border-ok/50 bg-ok/5" : "border-warn/60 bg-warn/10"
          }`}
        >
          ITEM #42
          <span className={`mt-1 block text-[11.5px] ${phase !== "done" ? "text-muted" : ok ? "text-ok" : "text-warn"}`}>
            {phase === "idle" || phase === "request" ? "AVAILABLE" : phase === "commit" ? "LOCKED…" : ok ? "BOOKED · A" : "BOOKED · A + B ✕"}
          </span>
        </div>
      </div>

      {/* log */}
      <div className="mt-2 min-h-[118px] rounded-lg border border-line bg-ink p-3 font-code text-[11px] leading-6" aria-live="polite">
        {log.map((l, i) => (
          <motion.p key={i + l.t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={l.tone === "ok" ? "text-ok" : l.tone === "bad" ? "text-warn" : l.tone === "dim" ? "text-dim" : "text-muted"}>
            {l.t}
          </motion.p>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={run} disabled={phase === "request" || phase === "commit"} className="h-10 rounded-full bg-fg px-5 font-mono text-[11px] tracking-[0.06em] text-ink transition-colors hover:bg-accent-soft disabled:opacity-40">
          ▶ RUN: 2 USERS, 1 ITEM
        </button>
        <AnimatePresence>
          {phase === "done" && ok && (
            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-[11.5px] leading-5 tracking-[0.06em] text-ok">
              <li>✓ INVENTORY CONSISTENCY</li>
              <li>✓ DOUBLE-BOOKING PREVENTION</li>
            </motion.ul>
          )}
          {phase === "done" && !ok && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setRules(true); reset(); }} className="font-mono text-[11.5px] tracking-[0.06em] text-accent-soft underline underline-offset-4">
              TURN RULES ON AND RETRY →
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- FCM app-state delivery ---------- */
function Notifications() {
  const states = ["FOREGROUND", "BACKGROUND", "TERMINATED"] as const;
  const [s, setS] = useState<(typeof states)[number]>("FOREGROUND");
  return (
    <div className="grid gap-4 rounded-2xl border border-line bg-ink-2/70 p-5 sm:grid-cols-[1fr_auto] md:p-6">
      <div>
        <p className="label mb-3">FCM · APP STATE</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="App state">
          {states.map((st) => (
            <button key={st} role="radio" aria-checked={s === st} onClick={() => setS(st)} className={`rounded-full border px-3 py-1.5 font-mono text-[11.5px] tracking-[0.06em] transition-colors ${s === st ? "border-accent text-fg" : "border-line text-muted hover:border-line-2"}`}>
              {st}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">Critical alerts are delivered in every state — via Firebase Cloud Messaging and Web Service Workers.</p>
      </div>
      {/* tiny phone */}
      <div className="relative mx-auto h-[150px] w-[84px] rounded-[16px] border border-line-2 bg-ink p-1.5" aria-hidden>
        <div className={`h-full rounded-[11px] transition-colors duration-500 ${s === "FOREGROUND" ? "bg-ink-3" : s === "BACKGROUND" ? "bg-[#d9d1c1]" : "bg-plate"}`}>
          <AnimatePresence mode="wait">
            <motion.div key={s} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mx-1 translate-y-1 rounded-md border border-accent/40 bg-accent/15 p-1.5 font-mono text-[7px] leading-tight text-fg">
              BOOKING CONFIRMED
              <span className="block text-[6px] text-accent-soft">DELIVERED ✓</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function RentalApp() {
  return (
    <div className="grid gap-4">
      <Architecture />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <DoubleBooking />
        <div className="grid content-start gap-4">
          <Notifications />
          <ul className="grid grid-cols-5 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {rental.systems.map((x) => (
              <li key={x.k} className="bg-ink-2 px-2 py-4 text-center">
                <span className="block font-mono text-[11.5px] tracking-[0.06em] text-fg">{x.k}</span>
                <span className="mt-1 block text-[11.5px] leading-tight text-dim">{x.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
