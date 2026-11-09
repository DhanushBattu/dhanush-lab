"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ui, useUI } from "@/lib/store";
import { lockScroll, scrollToId } from "@/lib/scroll";
// A short typographic film. Placeholder for a real video intro — swap in a <video> later if you record one.
const frames = [
  {
    k: "01",
    t: "REAL PERSON",
    s: "Battu Dhanush · Bengaluru",
  },
  {
    k: "02",
    t: "DIGITAL SCAN",
    s: "Curiosity, measured.",
  },
  {
    k: "03",
    t: "3D STRUCTURE",
    s: "Ideas, given a shape.",
  },
  {
    k: "04",
    t: "AI / DIGITAL IDENTITY",
    s: "Software development engineer × full-stack & AI/ML",
  },
  {
    k: "05",
    t: "DHANUSH LAB",
    s: "Inside the mind of an AI/ML builder.",
  },
];
const FRAME_MS = 2300;
export default function IntroOverlay() {
  const open = useUI((s) => s.introOpen);
  const [i, setI] = useState(0);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = (enter = false) => {
    ui.set({
      introOpen: false,
    });
    if (enter) setTimeout(() => scrollToId("lab"), 400);
  };
  useEffect(() => {
    if (!open) return;
    setI(0);
    lockScroll(true);
    closeBtn.current?.focus();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const iv = setInterval(() => setI((v) => Math.min(v + 1, frames.length - 1)), reduced ? FRAME_MS * 1.6 : FRAME_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(iv);
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const f = frames[i];
  const last = i === frames.length - 1;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="DHANUSH LAB intro"
          className="fixed inset-0 z-[95] overflow-hidden bg-plate text-plate-fg"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          <div aria-hidden className="absolute inset-y-0 right-0 w-full md:w-[60%]">
            <motion.img
              src="img/dhanush-portrait-fallback.webp"
              alt=""
              className="absolute left-1/2 top-1/2 h-[92%] -translate-x-1/2 -translate-y-1/2 object-contain [mask-image:linear-gradient(to_right,transparent,black_15%,black_80%,transparent)]"
              animate={{
                opacity: [0.9, 0.75, 0.45, 0.3, 0.18][i],
                filter: [`contrast(1) blur(0px)`, `contrast(1.2) blur(0px)`, `contrast(1.4) blur(1px)`, `contrast(1.6) blur(2px)`, `contrast(1.6) blur(6px)`][i],
                scale: 1 + i * 0.03,
              }}
              transition={{
                duration: 1.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
            <motion.div
              className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(240,160,56,.16)_0_1px,transparent_1px_5px)]"
              animate={{
                opacity: i >= 1 ? 0.8 : 0,
              }}
              transition={{
                duration: 1,
              }}
            />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(rgba(244,180,92,.55)_1px,transparent_1.5px)] [background-size:14px_14px] [mask-image:radial-gradient(ellipse_40%_45%_at_58%_38%,black,transparent)]"
              animate={{
                opacity: i >= 2 ? 0.9 : 0,
              }}
              transition={{
                duration: 1.2,
              }}
            />
            {i === 1 && (
              <motion.div
                className="absolute inset-x-0 h-px bg-amber"
                initial={{
                  top: "5%",
                }}
                animate={{
                  top: "90%",
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-plate),transparent_40%),linear-gradient(to_top,var(--color-plate),transparent_30%)]" />
          </div>
          <div className="relative flex h-full flex-col justify-between px-6 py-8 md:px-12 md:py-10">
            <div className="flex items-center justify-between">
              <span className="hand text-[26px] text-amber">Dhanush Lab, the intro</span>
              <button ref={closeBtn} onClick={() => close()} className="rounded-full border border-white/25 px-4 py-2 text-[14px] font-semibold text-plate-fg hover:border-amber">
                Skip ✕
              </button>
            </div>
            <div aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={f.k}
                  initial={{
                    opacity: 0,
                    y: 30,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -20,
                    filter: "blur(6px)",
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <p className="label mb-4 text-amber">
                    {f.k}
                    {" / 05"}
                  </p>
                  <p className="display max-w-[12ch] text-[clamp(48px,9vw,150px)]">{f.t}</p>
                  <p className="mt-5 max-w-md text-[17px] leading-relaxed text-plate-muted">{f.s}</p>
                  {last && (
                    <button onClick={() => close(true)} className="mt-9 h-12 rounded-full bg-amber px-6 text-[15px] font-semibold text-fg hover:bg-plate-fg">
                      Enter the lab →
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-2" aria-hidden>
              {frames.map((fr, j) => (
                <div key={fr.k} className="h-[3px] flex-1 rounded-full bg-white/15">
                  <motion.div
                    className="h-[3px] rounded-full bg-amber"
                    initial={false}
                    animate={{
                      width: j < i ? "100%" : j === i ? "100%" : "0%",
                    }}
                    transition={{
                      duration: j === i ? FRAME_MS / 1000 : 0.2,
                      ease: "linear",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
