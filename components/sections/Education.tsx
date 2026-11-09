"use client";
import { motion } from "framer-motion";
import { education } from "@/content/profile";
import { Note } from "@/components/ui/SectionHead";

const timeline = [
  { y: "Class X", t: "Secondary School · CBSE", p: education[3].place, m: education[3].meta },
  { y: "2021", t: education[2].title, p: education[2].place, m: education[2].meta },
  { y: "2023", t: "B.E. AI & ML", p: "BMS Institute of Technology & Management", m: "CGPA 8.0 · 2023–2027 (expected)" },
  { y: "2023", t: "B.Sc. Mathematics for Data Science", p: "IIT Madras (online)", m: "2023–Present" },
  { y: "2026", t: "Currently building", p: "Two degrees in parallel", m: "This lab is the log", now: true },
];

/** Deliberately compact — education supports the story, it doesn't lead it. */
export default function Education() {
  return (
    <section id="education" aria-labelledby="education-title" className="relative pb-6 pt-20 md:pb-10 md:pt-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Note className="mb-3">learning</Note>
            <h2 id="education-title" className="display text-[clamp(38px,5vw,72px)] outline-none">
              The training <span className="marker">data.</span>
            </h2>
          </div>
        </div>

        <ol data-build-group className="relative mt-14 grid gap-8 md:grid-cols-5 md:gap-0">
          <svg data-draw aria-hidden className="absolute left-0 right-0 top-[1px] hidden h-3 w-full text-fg/45 md:block" preserveAspectRatio="none" viewBox="0 0 1000 12"><path d="M0 6 C 120 3, 220 9, 340 6 S 560 3, 680 7 S 880 4, 1000 6" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>
          {timeline.map((e, i) => (
            <motion.li
              key={e.t}
              data-build={`timeline · ${e.y}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative border-l border-line pl-5 md:border-l-0 md:pl-0 md:pr-8"
            >
              <span className={`absolute -left-[5px] top-1 h-[11px] w-[11px] rounded-full border transition-transform duration-300 group-hover:scale-150 md:static md:block ${e.now ? "border-amber-ink bg-amber" : "border-fg/50 bg-ink"}`} />
              <p className="hand mt-0 text-[26px] md:mt-4">{e.y}</p>
              <h3 className={`mt-1 font-display text-[19px] font-bold leading-snug tracking-[-0.01em] ${e.now ? "text-accent" : ""}`}>{e.t}</h3>
              <p className="mt-1 text-[15px] text-muted">{e.p}</p>
              <p className="mt-2 text-[13px] font-medium text-dim">{e.m}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
