"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ui, useUI } from "@/lib/store";
import { ask, kbStats, suggestions, type Answer } from "./engine";
import DollTrigger from "./DollTrigger";

type Msg = { id: number; role: "user" | "ai" | "sys"; lines: string[]; source?: string; typed?: number };

/** Types an answer out line by line — fast, readable, skippable (click / reduced motion shows it all). */
function useTyping(msgs: Msg[], setMsgs: React.Dispatch<React.SetStateAction<Msg[]>>) {
  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== "ai") return;
    const total = last.lines.join("\n").length;
    if ((last.typed ?? total) >= total) return;
    const t = setTimeout(() => setMsgs((m) => m.map((x) => (x.id === last.id ? { ...x, typed: Math.min(total, (x.typed ?? 0) + 6) } : x))), 12);
    return () => clearTimeout(t);
  }, [msgs, setMsgs]);
}

function Typed({ m }: { m: Msg }) {
  const full = m.lines.join("\n");
  const shown = m.typed === undefined ? full : full.slice(0, m.typed);
  return (
    <>
      {shown.split("\n").map((l, i) => (
        <p key={i} className={l.startsWith("→") || l.startsWith("  →") ? "text-plate-fg/85" : "text-plate-fg"}>
          {l}
        </p>
      ))}
    </>
  );
}

export default function AskAI() {
  const open = useUI((s) => s.assistantOpen);
  const booted = useUI((s) => s.booted);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const reduced = useRef(false);

  useTyping(msgs, setMsgs);

  // on phones, keep the hero CTAs clear: the floating button appears once you start scrolling
  const [show, setShow] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  // the footer has its own "ask his assistant" line — the floating doll steps aside there
  useEffect(() => {
    const el = document.getElementById("ask-cta");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { rootMargin: "0px 0px 60px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const on = () => setShow(window.innerWidth >= 640 || window.scrollY > window.innerHeight * 0.5);
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 250);
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        ui.set({ assistantOpen: false });
        trigger.current?.focus();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const a: Answer = ask(t);
    const id = Date.now();
    setMsgs((m) => [
      ...m.map((x) => ({ ...x, typed: undefined })), // finish any answer still typing
      { id, role: "user", lines: [t] },
      { id: id + 1, role: "ai", lines: a.lines, source: a.source, typed: reduced.current ? undefined : 0 },
    ]);
    setQ("");
  };

  return (
    <>
      {/* floating trigger — the D-01 doll */}
      <DollTrigger ref={trigger} visible={booted && !open && show && !ctaVisible} onOpen={() => ui.set({ assistantOpen: true })} />

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Ask Dhanush AI"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-2 z-[97] flex flex-col overflow-hidden plate rounded-[10px] border border-black/40 sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[620px] sm:max-h-[calc(100svh-40px)] sm:w-[460px]"
            data-lenis-prevent
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="font-code text-[12px] tracking-[0.12em] text-plate-fg">
                  DHANUSH_LAB<span className="text-plate-teal">://</span>assistant
                </p>
                <p className="mt-0.5 font-code text-[10.5px] tracking-[0.14em] text-plate-muted">SOURCE: PORTFOLIO ONLY · NO GUESSING</p>
              </div>
              <button onClick={() => ui.set({ assistantOpen: false })} className="rounded-full border border-white/10 px-3 py-1.5 font-code text-[11px] tracking-[0.14em] text-plate-muted hover:border-amber hover:text-plate-fg" aria-label="Close assistant">
                ESC ✕
              </button>
            </div>

            {/* log */}
            <div ref={log} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 font-code text-[12px] leading-[1.7]" aria-live="polite">
              <div className="text-plate-muted">
                <p>&gt; boot assistant … ok</p>
                <p>&gt; knowledge base: {kbStats}</p>
                <p>&gt; mode: grounded — answers come only from this portfolio</p>
              </div>
              <div className="border-l border-amber/50 pl-3 text-plate-fg">
                <p>Hi, I&apos;m Dhanush&apos;s assistant. Ask me anything you need: his projects, skills, experience, studies, or what he does outside work.</p>
              </div>

              {msgs.map((m) =>
                m.role === "user" ? (
                  <p key={m.id} className="text-amber">
                    <span className="text-plate-muted">visitor ›</span> {m.lines[0]}
                  </p>
                ) : (
                  <div key={m.id} className="border-l border-amber/50 pl-3" onClick={() => setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, typed: undefined } : x)))}>
                    <Typed m={m} />
                    {m.typed === undefined && <p className="mt-1 text-[10.5px] tracking-[0.14em] text-plate-muted">SRC · {m.source}</p>}
                  </div>
                )
              )}

              {msgs.length === 0 && (
                <div>
                  <p className="mb-2 text-[11px] tracking-[0.16em] text-plate-muted">TRY ONE:</p>
                  <ul className="flex flex-col items-start gap-1.5">
                    {suggestions.map((s) => (
                      <li key={s}>
                        <button onClick={() => submit(s)} className="rounded-md border border-white/10 px-2.5 py-1.5 text-left text-[11px] text-plate-muted transition-colors hover:border-amber/70 hover:text-plate-fg">
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* quick chips after first message */}
            {msgs.length > 0 && (
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-white/10 px-4 py-2">
                {["Projects", "Experience", "Tech stack", "Education", "Hobbies", "Contact"].map((s) => (
                  <button key={s} onClick={() => submit(s)} className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 font-code text-[11px] text-plate-muted hover:border-amber/70 hover:text-plate-fg">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(q);
              }}
              className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
            >
              <span className="font-code text-[13px] text-plate-teal" aria-hidden>
                ›
              </span>
              <label htmlFor="ask-input" className="sr-only">
                Ask a question about Dhanush
              </label>
              <input
                id="ask-input"
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ask about builds, skills, experience…"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent font-code text-[12px] text-plate-fg placeholder:text-plate-muted/80 focus:outline-none"
              />
              <button type="submit" className="rounded-md border border-white/20 px-3 py-1.5 font-code text-[11px] tracking-[0.14em] hover:border-amber" aria-label="Send">
                RUN ↵
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes caret{0%,50%{opacity:1}51%,100%{opacity:0}}`}</style>
    </>
  );
}
