"use client";
import dynamic from "next/dynamic";
import { forwardRef, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWebGL } from "@/lib/hooks";

const DollCanvas = dynamic(() => import("@/components/three/DollCanvas"), { ssr: false });

type Props = { visible: boolean; onOpen: () => void };

/**
 * The floating lab assistant: a small 3D doll bottom-right. It follows the cursor with its head,
 * waves on hover, and says hello once. Falls back to a text pill without WebGL.
 */
const DollTrigger = forwardRef<HTMLButtonElement, Props>(function DollTrigger({ visible, onOpen }, ref) {
  const webgl = useWebGL();
  const look = useRef({ x: 0, y: 0 });
  const wave = useRef(false);
  const self = useRef<HTMLButtonElement | null>(null);
  const [bubble, setBubble] = useState(false);
  const [hover, setHover] = useState(false);

  // head follows the cursor, relative to where the doll sits on screen
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = self.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      look.current.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 420));
      look.current.y = Math.max(-1, Math.min(1, -(e.clientY - (r.top + r.height / 2)) / 420));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // one friendly hello when it first appears
  useEffect(() => {
    if (!visible) return;
    const a = setTimeout(() => {
      // on phones the note would sit on top of the content, so D-01 only waves
      setBubble(window.matchMedia("(min-width: 768px)").matches);
      wave.current = true;
    }, 1600);
    const b = setTimeout(() => {
      setBubble(false);
      wave.current = false;
    }, 6200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible && true]);

  const setRefs = (el: HTMLButtonElement | null) => {
    self.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  if (webgl === false) {
    return (
      <button
        ref={setRefs}
        onClick={onOpen}
        aria-haspopup="dialog"
        className={`fixed bottom-4 right-4 z-[80] flex h-11 items-center gap-2 rounded-full bg-fg px-4 text-[14px] font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(40,30,15,.6)] transition-opacity sm:bottom-5 sm:right-5 ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <span className="h-2 w-2 rounded-full bg-amber" /> Ask Dhanush AI
      </button>
    );
  }

  const showBubble = visible && (bubble || hover);

  return (
    <div className={`fixed bottom-2 right-2 z-[80] transition-all duration-700 sm:bottom-4 sm:right-4 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute bottom-[calc(100%-6px)] right-3 w-[210px] rounded-[4px] rounded-br-none bg-[#f7d98a] px-3.5 py-2.5 text-[14px] leading-snug text-fg shadow-[0_14px_24px_-14px_rgba(60,40,0,.6)] rotate-[-1.5deg]"
            aria-hidden
          >
            Hi! I&apos;m D-01. Try Dhanush&apos;s <span className="font-semibold">live projects</span> first, or <span className="font-semibold text-accent">ask me anything →</span>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        ref={setRefs}
        onClick={onOpen}
        onPointerEnter={() => {
          setHover(true);
          wave.current = true;
        }}
        onPointerLeave={() => {
          setHover(false);
          wave.current = false;
        }}
        onFocus={() => {
          setHover(true);
          wave.current = true;
        }}
        onBlur={() => {
          setHover(false);
          wave.current = false;
        }}
        aria-haspopup="dialog"
        aria-label="Ask Dhanush AI — open the lab assistant"
        className="group relative block h-[104px] w-[88px] rounded-2xl sm:h-[128px] sm:w-[108px]"
      >
        <span aria-hidden className="absolute inset-x-3 bottom-1 h-6 rounded-full bg-fg/25 blur-xl transition-opacity group-hover:opacity-100 sm:opacity-70" />
        {webgl && <DollCanvas look={look} wave={wave} active={visible} />}
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-fg px-2 py-0.5 text-[11px] font-semibold text-ink sm:text-[12px]">
          Ask AI
        </span>
      </button>
    </div>
  );
});

export default DollTrigger;
