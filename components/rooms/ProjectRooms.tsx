"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cafe, experience, ipl, profile, rental, veriai } from "@/content/profile";
import { ui, useUI, type RoomId } from "@/lib/store";
import { lockScroll } from "@/lib/scroll";
import RentalApp from "@/components/builds/RentalApp";
import IplData from "@/components/builds/IplData";
import VeriAI from "@/components/builds/VeriAI";
import ExperienceDemo from "./ExperienceDemo";
// live clock + timers → client-only
const CyberCafe = dynamic(() => import("@/components/builds/CyberCafe"), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-2xl border border-line bg-ink-2/60" />,
});

type Room = {
  id: RoomId;
  tab: string;
  kind: string;
  title: string[];
  summary: string;
  stack: string[];
  meta?: React.ReactNode;
  play: string;
  repo?: string;
  Demo: React.ComponentType;
};

export const ROOMS: Room[] = [
  {
    id: "automation",
    tab: "AI AUTOMATION",
    kind: "REAL WORLD",
    title: ["AI", "Automation"],
    summary: `${experience.role} for ${experience.org}. A Meta-compliant WhatsApp Business API platform with a bilingual Generative AI assistant for localized content.`,
    stack: ["Generative AI", "WhatsApp Business API", "Prompt engineering", "Segmentation"],
    meta: <p className="mt-4 text-[13px] font-medium text-muted">{`${experience.org} · ${experience.mode}`}</p>,
    play: "Hover or tap each stage of the pipeline.",
    Demo: ExperienceDemo,
  },
  {
    id: "veriai",
    tab: "VERIAI",
    kind: "BUILD · AI",
    title: ["VeriAI"],
    summary: veriai.summary,
    stack: veriai.stack,
    meta: <p className="mt-4 text-[13px] font-medium text-muted">{veriai.subtitle}</p>,
    play: "Press “Verify this answer”, watch each claim get checked, then switch the quote rule off.",
    repo: profile.repos.veriai,
    Demo: VeriAI,
  },
  {
    id: "rental",
    tab: "RENTAL APP",
    kind: "BUILD",
    title: ["Rental", "App"],
    summary: rental.summary,
    stack: rental.stack,
    meta: (
      <p className="mt-4 flex gap-2 font-mono text-[11.5px] tracking-[0.06em] text-muted">
        {rental.platforms.map((p) => (
          <span key={p} className="rounded border border-line px-1.5 py-0.5">
            {p}
          </span>
        ))}
      </p>
    ),
    play: "Click the architecture nodes, then run the double-booking test with the rules on and off.",
    repo: profile.repos.rental,
    Demo: RentalApp,
  },
  {
    id: "cafe",
    tab: "CYBER CAFÉ",
    kind: "BUILD",
    title: ["Cyber", "Café"],
    summary: cafe.summary,
    stack: cafe.stack,
    play: "Click any computer to start or end a session — watch revenue, sessions and the log update.",
    Demo: CyberCafe,
  },
  {
    id: "ipl",
    tab: "IPL INTELLIGENCE",
    kind: "DATA · ML",
    title: ["IPL", "Intelligence"],
    summary: ipl.summary,
    stack: ipl.stack,
    meta: <p className="mt-4 text-[13px] font-medium text-muted">{ipl.subtitle}</p>,
    play: "Switch between batters, bowlers, teams and seasons, and hover the bars.",
    repo: profile.repos.ipl,
    Demo: IplData,
  },
];
/**
 * Projects don't sit on the home page — each opens here, as its own full-screen "room",
 * when a visitor chooses it from THE LAB.
 */
export default function ProjectRooms() {
  const roomId = useUI((s) => s.room);
  const from = useUI((s) => s.roomFrom);
  const scroller = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const idx = ROOMS.findIndex((r) => r.id === roomId);
  const room = idx >= 0 ? ROOMS[idx] : null;
  const open = !!room;
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    setTimeout(() => closeBtn.current?.focus(), 60);
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ui.get().assistantOpen)
        ui.set({
          room: null,
        });
    };
    window.addEventListener("keydown", k);
    return () => {
      window.removeEventListener("keydown", k);
      lockScroll(false);
    };
  }, [open]);
  // new room → back to the top, and keep the active tab visible on narrow screens
  useEffect(() => {
    scroller.current?.scrollTo({
      top: 0,
    });
    setTimeout(
      () =>
        document.querySelector('[aria-label="Project rooms"] [aria-current="page"]')?.scrollIntoView({
          inline: "center",
          block: "nearest",
        }),
      80,
    );
  }, [roomId]);
  const go = (d: number) =>
    ui.set({
      room: ROOMS[(idx + d + ROOMS.length) % ROOMS.length].id,
    });
  return (
    <AnimatePresence>
      {room && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${room.tab} — project room`}
          className="paper-grid fixed inset-0 z-[88] flex flex-col bg-ink"
          // the room grows out of the card that was clicked, and folds back into it on close
          initial={{ clipPath: from ?? "inset(100% 0px 0px 0px round 0px)" }}
          animate={{ clipPath: from ? "inset(0px 0px 0px 0px round 0px)" : "inset(0% 0px 0px 0px round 0px)" }}
          exit={{ clipPath: from ?? "inset(0px 0px 100% 0px round 0px)" }}
          transition={{ duration: from ? 0.75 : 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-center gap-3 border-b border-line-2 bg-ink-2 px-4 py-3 md:px-8">
            <span className="hand hidden text-[24px] lg:inline">the lab /</span>
            <nav aria-label="Project rooms" className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
              {ROOMS.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() =>
                    ui.set({
                      room: r.id,
                    })
                  }
                  aria-current={r.id === room.id ? "page" : undefined}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition-colors ${r.id === room.id ? "border-fg bg-fg text-ink" : "border-line-2 text-muted hover:border-fg hover:text-fg"}`}
                >
                  {r.title.join(" ")}
                </button>
              ))}
            </nav>
            <button
              ref={closeBtn}
              onClick={() =>
                ui.set({
                  room: null,
                })
              }
              className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-[14px] font-semibold text-ink hover:bg-fg md:px-4"
            >
              <span className="hidden sm:inline">{"Back to the lab "}</span>✕
            </button>
          </div>
          <div ref={scroller} className="flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
            <AnimatePresence mode="wait">
              <motion.article
                key={room.id}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -12,
                }}
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-10 md:px-10 md:pt-14"
              >
                <div className="relative grid gap-10 lg:grid-cols-[minmax(280px,360px)_1fr] lg:gap-14">
                  <header className="lg:sticky lg:top-8 lg:self-start">
                    <p className={`label mb-4 ${room.kind === "REAL WORLD" ? "text-ok" : "text-accent"}`}>
                      {"Room "}
                      {idx + 1}
                      {" · "}
                      {room.kind.charAt(0) + room.kind.slice(1).toLowerCase()}
                    </p>
                    <h2 className="display text-[clamp(38px,4vw,62px)]">
                      {room.title.map((t) => (
                        <span key={t} className="block">
                          {t}
                        </span>
                      ))}
                    </h2>
                    {room.meta}
                    <p className="mt-6 text-[15px] leading-relaxed text-muted">{room.summary}</p>
                    <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech stack">
                      {room.stack.map((s) => (
                        <li key={s} className="rounded-full border border-line-2 bg-ink-2 px-3 py-1 text-[13px] font-medium text-fg">
                          {s}
                        </li>
                      ))}
                    </ul>
                    {room.repo && (
                      <a href={room.repo} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent underline underline-offset-4">
                        View the code on GitHub <span aria-hidden>↗</span>
                      </a>
                    )}
                    <p className="relative mt-8 rotate-[-1deg] bg-[#f7d98a] p-4 text-[15px] leading-relaxed text-fg shadow-[0_14px_24px_-16px_rgba(60,40,0,.6)]">
                      <span className="tape -top-3 left-6 rotate-[-4deg]" />
                      <span className="hand mb-1 block text-[26px] leading-none">play with the simulation ▸</span>
                      {room.play}
                    </p>
                  </header>
                  <div>
                    <room.Demo />
                  </div>
                </div>
                <div className="mt-16 grid grid-cols-2 gap-3 border-t border-dashed border-line-2 pt-6">
                  <button onClick={() => go(-1)} className="sheet group rounded-[4px] p-4 text-left transition-colors hover:border-accent">
                    <span className="text-[13px] font-semibold text-dim">← Previous room</span>
                    <span className="mt-1 block font-display text-[16px] font-bold md:text-[20px]">{ROOMS[(idx - 1 + ROOMS.length) % ROOMS.length].title.join(" ")}</span>
                  </button>
                  <button onClick={() => go(1)} className="sheet group rounded-[4px] p-4 text-right transition-colors hover:border-accent">
                    <span className="text-[13px] font-semibold text-dim">Next room →</span>
                    <span className="mt-1 block font-display text-[16px] font-bold md:text-[20px]">{ROOMS[(idx + 1) % ROOMS.length].title.join(" ")}</span>
                  </button>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
