"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { availability, profile } from "@/content/profile";
import { SplitLines, Reveal } from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import { useInView, useIsLowPower, useWebGL } from "@/lib/hooks";
import { ui } from "@/lib/store";


const AiCore = dynamic(() => import("@/components/three/AiCore"), { ssr: false });

const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Hello from your portfolio — DHANUSH LAB")}`;
const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}&su=${encodeURIComponent("Hello from your portfolio — DHANUSH LAB")}`;

export default function Final() {
  const webgl = useWebGL();
  const low = useIsLowPower();
  const [ref, inView] = useInView<HTMLDivElement>("100px");
  const [copied, setCopied] = useState(false);

  // Opens the visitor's mail app (mailto). Also copies the address, so it's ready even if no mail app is set up.
  const onEmail = () => {
    navigator.clipboard
      ?.writeText(profile.email)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2600);
      })
      .catch(() => {});
  };

  const btn = "group h-12 rounded-full border border-line-2 bg-ink-2/70 px-5 text-[15px] font-semibold transition-colors hover:border-fg";

  return (
    <footer id="contact" aria-labelledby="final-title" className="relative overflow-hidden pt-16 md:pt-24">
      <div aria-hidden className="paper-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_30%)]" />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p data-write className="hand mb-4 text-[28px]">end of the tour, beginning of something →</p>
            <SplitLines
              id="final-title"
              as="h2"
              label="Let's build something intelligent."
              lines={["Let's build", "something", <><span key="m" className="marker">intelligent</span><span key="d" className="text-accent">.</span></>]}
              className="display text-[clamp(48px,8vw,132px)] outline-none"
            />
          </div>
          <div ref={ref} className="relative mx-auto hidden aspect-square w-full max-w-[320px] lg:block">
            {webgl && <AiCore active={inView} low={low} />}
            {webgl === false && <div className="absolute inset-[20%] rounded-full border-2 border-dashed border-accent/60" />}
          </div>
        </div>

        <div className="mt-12 grid items-end gap-8 border-t border-line pt-8 md:grid-cols-2">
          <Reveal>
            <p className="label">Available for</p>
            <p className="mt-3 font-display text-[clamp(24px,2.6vw,36px)] font-bold leading-tight tracking-[-0.02em]">
              Roles in {availability.join(" · ")}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul data-build-group className="flex flex-wrap gap-3 md:justify-end">
              <li data-build="link · github">
                <Magnetic as="a" href={profile.github} target="_blank" className={btn}>
                  GitHub <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </Magnetic>
              </li>
              <li data-build="link · linkedin">
                <Magnetic as="a" href={profile.linkedin} target="_blank" className={btn}>
                  LinkedIn <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </Magnetic>
              </li>
              <li data-build="link · email">
                <Magnetic as="a" href={mailto} onClick={onEmail} ariaLabel={`Email ${profile.email}`} className={`${btn} !border-accent !bg-accent !text-ink hover:!bg-fg`}>
                  Email <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </Magnetic>
              </li>
              <li data-build="link · résumé">
                <Magnetic onClick={() => ui.set({ resumeOpen: true })} className={btn}>
                  Résumé <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </Magnetic>
              </li>
            </ul>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-muted md:justify-end">
              <a href={mailto} onClick={onEmail} className="select-all underline-offset-4 hover:text-fg hover:underline">
                {profile.email}
              </a>
              <a href={gmail} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4">
                open in Gmail ↗
              </a>
              <AnimatePresence>
                {copied && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ok" role="status">
                    ✓ address copied
                  </motion.span>
                )}
              </AnimatePresence>
            </p>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-line pt-5 text-[14px] text-muted sm:flex-row sm:items-center">
          <span className="font-display font-bold text-fg">Dhanush Lab</span>
          <Link href="/about" className="underline-offset-4 hover:text-fg hover:underline">About Dhanush Battu</Link>
          <span>{profile.location}</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* the last word: hand the visitor to the assistant */}
      <button
        id="ask-cta"
        onClick={() => ui.set({ assistantOpen: true })}
        className="group relative mt-6 block w-full bg-plate text-plate-fg transition-colors hover:bg-[#211e16]"
      >
        <span className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-left md:px-10 md:py-8">
          <span className="font-display text-[clamp(22px,3vw,42px)] font-bold leading-tight tracking-[-0.03em]">
            Wanna ask or know something? <span className="text-amber">Ask his assistant</span>
          </span>
          <span className="flex items-center gap-3 text-[14px] font-semibold text-plate-teal">
            D-01 is online
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber text-[18px] text-fg transition-transform group-hover:translate-x-1">→</span>
          </span>
        </span>
      </button>
    </footer>
  );
}
