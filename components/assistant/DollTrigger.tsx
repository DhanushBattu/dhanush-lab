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

  // say hello on its own: once when it first appears, and once more when the visitor reaches the projects
  const said = useRef(0);
  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const greet = (after: number, length: number) => {
      timers.push(
        setTimeout(() => {
          // on phones the note would sit on top of the content, so D-01 only waves
          setBubble(window.matchMedia("(min-width: 768px)").matches);
          wave.current = true;
        }, after),
        setTimeout(() => {
          setBubble(false);
          wave.current = false;
        }, after + length),
      );
    };
    if (said.current === 0) {
      said.current = 1;
      greet(1200, 9000);
    }
    const lab = document.getElementById("lab");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && said.current === 1) {
          said.current = 2;
          greet(600, 6500);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    if (lab) io.observe(lab);
    return () => {
      timers.forEach(clearTimeout);
      io.disconnect();
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
          <motion.button
            type="button"
            onClick={onOpen}
            tabIndex={-1}
            initial={{ opacity: 0, y: 10, scale: 0.92, rotate: 2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -1.5 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            whileHover={{ y: -2 }}
            className="absolute bottom-[calc(100%-6px)] right-3 w-[220px] rounded-[4px] rounded-br-none bg-[#f7d98a] px-3.5 py-2.5 text-left text-[14px] leading-snug text-fg shadow-[0_14px_24px_-14px_rgba(60,40,0,.6)]"
            aria-hidden
          >
            Hi, I&apos;m his assistant. <span className="font-semibold text-accent">Ask me anything you need →</span>
          </motion.button>
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
