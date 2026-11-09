"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ui } from "@/lib/store";
import { getLenis, lockScroll } from "@/lib/scroll";

const HOLD_MS = 2000; // the entry card stays for 2 seconds

/** Entry card: "You are entering DHANUSH LAB" — 2s, then the lab opens. Skipped for reduced motion. */
export default function Loader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      ui.set({ booted: true });
      return;
    }
    // every visit starts at the very top (browsers otherwise restore the old scroll position
    // on reload), and the page can't be scrolled while the entry card is up
    const deepLink = !!window.location.hash;
    if (!deepLink) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
    lockScroll(true);
    const end = setTimeout(() => {
      if (!deepLink) {
        window.scrollTo(0, 0);
        getLenis()?.scrollTo(0, { immediate: true, force: true });
      }
      lockScroll(false);
      setDone(true);
      ui.set({ booted: true });
    }, HOLD_MS);
    return () => {
      clearTimeout(end);
      lockScroll(false);
    };
  }, []);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="paper-grid fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink px-6"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-live="polite"
          aria-label="You are entering DHANUSH LAB — into the mind of an AI/ML engineer"
        >
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(240,160,56,.18),transparent)]" />
          <div className="relative text-center" aria-hidden>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted md:text-[15px]"
            >
              You are entering into
            </motion.p>
            <div className="mt-4 overflow-hidden pb-[0.1em] pt-[0.06em]">
              <motion.p
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.15, ease }}
                className="display text-[clamp(52px,11vw,150px)]"
              >
                DHANUSH <span className="marker">LAB</span>
              </motion.p>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="hand mt-4 text-[26px] md:text-[32px]"
            >
              (into the mind of an AI/ML engineer)
            </motion.p>
            <div className="mx-auto mt-10 h-[3px] w-[min(320px,70vw)] rounded-full bg-line">
              <motion.div
                className="h-[3px] rounded-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: HOLD_MS / 1000 - 0.1, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
