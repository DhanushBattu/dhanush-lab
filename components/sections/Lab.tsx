"use client";
import { openRoom, type RoomId } from "@/lib/store";
import { SplitLines, Reveal } from "@/components/ui/Reveal";
import Tilt from "@/components/ui/Tilt";
import { Note } from "@/components/ui/SectionHead";

/** One room per project. Visitors jump straight to the one they care about. */
const rooms = [
  {
    kind: "Real world",
    title: "AI Automation",
    org: "Elite IIT · Freelance",
    line: "WhatsApp Business API + a bilingual Generative AI assistant for marketing.",
    signal: "+32% engagement",
    stack: ["GenAI", "WhatsApp API", "Prompting"],
    inside: "Walk the pipeline",
    id: "automation" as RoomId,
  },
  {
    kind: "Build · AI",
    title: "VeriAI",
    org: "Major project · team of 4",
    line: "Fact-checks every claim in an AI answer against Wikipedia, Wikidata, Crossref and OpenAlex.",
    signal: "141 automated tests",
    stack: ["FastAPI", "React", "PyTorch"],
    inside: "Verify an answer",
    id: "veriai" as RoomId,
  },
  {
    kind: "Build",
    title: "Rental App",
    org: "Web · iOS · Android",
    line: "Cross-platform marketplace with RBAC, secure KYC and transaction-safe bookings.",
    signal: "Double-booking eliminated",
    stack: ["Flutter", "Firebase", "FCM"],
    inside: "Run the double-booking test",
    id: "rental" as RoomId,
  },
  {
    kind: "Build",
    title: "Cyber Café",
    org: "Full-stack web app",
    line: "Session tracking, computer allocation, billing and a live admin dashboard.",
    signal: "Live monitoring",
    stack: ["PHP", "MySQL", "JavaScript"],
    inside: "Allocate a computer",
    id: "cafe" as RoomId,
  },
  {
    kind: "Data · ML",
    title: "IPL Intelligence",
    org: "Analytics & winner prediction",
    line: "Team, toss and player trends across IPL history, plus a Flask prediction platform.",
    signal: "1,095 matches · 6 models",
    stack: ["Python", "Scikit-learn", "Flask"],
    inside: "Switch the data",
    id: "ipl" as RoomId,
  },
];

export default function Lab() {
  return (
    <section id="lab" aria-labelledby="lab-title" className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <Note className="mb-3">the lab</Note>
        <SplitLines
          id="lab-title"
          label="This is where ideas become systems."
          lines={["This is where", <>ideas become <span key="s" className="marker">systems.</span></>]}
          className="display max-w-[14ch] text-[clamp(42px,6.6vw,104px)] outline-none"
        />
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-[52ch] text-[17px] leading-relaxed text-muted">
            Five rooms, five systems: one real-world project and four builds. Each one opens as its own room with a live simulation. Pick the one you want.
          </p>
        </Reveal>

        {/* start here: a sticky note that sends visitors into the projects first */}
        <div
          data-stick
          id="lab-start"
          className="relative mt-14 inline-flex max-w-full rotate-[-1.5deg] scroll-mt-28 flex-wrap items-center gap-x-5 gap-y-1 bg-[#f7d98a] px-5 py-3.5 shadow-[0_14px_24px_-16px_rgba(60,40,0,.6)] md:px-6"
        >
          <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[2deg]" />
          <span data-write className="hand text-[28px] text-fg">start here →</span>
          <p className="text-[16px] font-medium leading-snug text-fg md:text-[17px]">
            5 live projects. Pick one and <span className="underline decoration-fg/40 decoration-2 underline-offset-4">play with the simulation</span>.
          </p>
        </div>

        <ul id="lab-rooms" className="mt-10 grid scroll-mt-28 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {rooms.map((r, i) => (
            <li key={r.title} data-stick>
              <Tilt className="group h-full rounded-[4px]">
                <button
                  onClick={(e) => openRoom(r.id, e.currentTarget)}
                  aria-label={`${r.title}, ${r.kind.toLowerCase()} project. ${r.line} Open the project room and play with the simulation.`}
                  className="sheet relative flex h-full min-h-[340px] w-full flex-col rounded-[4px] p-6 text-left transition-[border-color] duration-300 hover:border-accent"
                  style={{ rotate: `${[-0.8, 0.6, -0.4, 0.9, -0.6][i]}deg` }}
                >
                  <span className="tape -top-3 left-6 rotate-[-3deg]" />
                  <span className={`text-[12px] font-semibold uppercase tracking-[0.06em] ${r.kind === "Real world" ? "text-ok" : "text-muted"}`}>{r.kind}</span>

                  <div className="mt-auto pt-12">
                    <h3 className="font-display text-[28px] font-bold leading-[1.02] tracking-[-0.03em]">{r.title}</h3>
                    <p className="mt-1.5 text-[13px] font-medium text-dim">{r.org}</p>
                    <p className="mt-3 text-[15px] leading-snug text-muted">{r.line}</p>
                    <p className="hand mt-4 text-[24px] leading-none">{r.signal}</p>
                  </div>

                  <div className="mt-5 flex w-full items-end justify-between gap-3 border-t border-dashed border-line-2 pt-4">
                    <span className="text-[13px] text-dim">{r.stack.join(" · ")}</span>
                    <span className="shrink-0 text-[13px] font-semibold text-accent">Open →</span>
                  </div>

                  {/* hover: a rubber stamp inviting a play */}
                  <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[4px] bg-ink-2/95 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="flex h-36 w-36 rotate-[-10deg] flex-col items-center justify-center rounded-full border-[3px] border-double border-accent text-center text-accent transition-transform duration-300 group-hover:scale-105">
                      <span className="text-[20px]">▶</span>
                      <span className="mt-1 text-[12px] font-bold uppercase leading-tight tracking-[0.08em]">
                        Play with
                        <br />
                        simulations
                      </span>
                      <span className="hand mt-1 px-3 text-[17px] leading-none text-accent">{r.inside.toLowerCase()}</span>
                    </span>
                  </span>
                </button>
              </Tilt>
            </li>
          ))}
        </ul>
      </div>
          </section>
  );
}
