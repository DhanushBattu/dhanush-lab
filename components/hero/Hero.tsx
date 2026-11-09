"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { availability, profile } from "@/content/profile";
import { useUI, ui } from "@/lib/store";
import { scrollToId } from "@/lib/scroll";
import { SplitLines } from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";


const ease = [0.16, 1, 0.3, 1] as const;

/** A pencil arrow. `d` is drawn in a 120×80 box. */
function Arrow({ d, className = "", show, delay = 0 }: { d: string; className?: string; show: boolean; delay?: number }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" aria-hidden className={className}>
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={show ? { pathLength: 1 } : {}}
        transition={{ duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}

export default function Hero() {
  const booted = useUI((s) => s.booted);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const printY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const printR = useTransform(scrollYProgress, [0, 1], [-1.8, -4]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  // the print leans toward the cursor and the photo shifts inside it, so it reads as a real object
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 90, damping: 16, mass: 0.6 };
  const tiltX = useSpring(useTransform(my, [-1, 1], [5, -5]), spring);
  const tiltY = useSpring(useTransform(mx, [-1, 1], [-6, 6]), spring);
  const photoX = useSpring(useTransform(mx, [-1, 1], [12, -12]), spring);
  const photoY = useSpring(useTransform(my, [-1, 1], [10, -10]), spring);
  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  // the photo develops in (fade + unblur) once it has loaded
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (img.current?.complete) setLoaded(true);
  }, []);

  const fadeUp = (d: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: booted ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, delay: d, ease },
  });
  // handwritten notes appear left to right, as if being written
  const note = (d: number) => ({
    initial: { opacity: 0, clipPath: "inset(-30% 100% -30% 0%)" },
    animate: booted ? { opacity: 1, clipPath: "inset(-30% 0% -30% 0%)" } : {},
    transition: { duration: 0.9, delay: d, ease: [0.65, 0, 0.35, 1] as const },
  });
  const print = {
    initial: { opacity: 0, y: -40, rotate: 4, scale: 1.04 },
    animate: booted ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : {},
    transition: { type: "spring" as const, stiffness: 120, damping: 14, delay: 0.25 },
  };

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" onPointerMove={onMove} onPointerLeave={onLeave} className="paper-grid relative isolate overflow-hidden">
      <div className="mx-auto grid max-w-[1400px] items-center gap-x-10 gap-y-10 px-5 pb-10 pt-28 md:px-10 md:pt-32 lg:min-h-[calc(100svh-150px)] lg:grid-cols-12 lg:pb-8">
        {/* ---------- the photo print ---------- */}
        <motion.div style={{ y: printY, rotate: printR }} className="relative mx-auto w-full max-w-[560px] lg:order-2 lg:col-span-6 lg:col-start-7">
          <motion.div style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100 }}>
          <motion.div {...print} className="sheet relative bg-[#fbf8f1] p-2.5 pb-12 sm:p-3 sm:pb-14">
            <span className="tape -left-6 -top-3 rotate-[-28deg]" />
            <span className="tape -right-6 -top-2 rotate-[24deg]" />
            <div className="group/photo plate relative aspect-[1266/1242] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                ref={img}
                src="img/dhanush-hero.webp"
                alt="Portrait of Battu Dhanush"
                width={1266}
                height={1242}
                fetchPriority="high"
                onLoad={() => setLoaded(true)}
                style={{ x: photoX, y: photoY, scale: 1.06 }}
                className={`h-full w-full object-cover transition-[opacity,filter] duration-[1200ms] ease-out motion-reduce:transition-none ${loaded ? "opacity-100 blur-0" : "opacity-0 blur-md"}`}
              />
            </div>
            <p className="hand absolute bottom-2.5 left-4 right-4 text-[22px] text-fg/80 sm:bottom-3 sm:text-[26px]">B. Dhanush, Bengaluru</p>
          </motion.div>
          </motion.div>

          {/* margin notes */}
          <motion.p {...note(1.4)} className="hand absolute -left-40 top-[18%] hidden w-36 rotate-[-4deg] text-right text-[25px] xl:block">
            the real photo
            <Arrow d="M10 20 C 50 22, 80 30, 112 58 M100 58 L112 58 L108 46" className="ml-auto mt-1 h-12 w-20 text-amber-ink" show={booted} delay={1.7} />
          </motion.p>
        </motion.div>

        {/* ---------- who ---------- */}
        <motion.div style={{ y: textY }} className="lg:order-1 lg:col-span-6">
          <motion.p {...fadeUp(0.2)} className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-ink-2/80 px-3.5 py-1.5 text-[13px] font-medium text-fg">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok/50 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            Open to roles in {availability.join(" & ")}
            <span className="hidden text-muted sm:inline">· Bengaluru</span>
          </motion.p>

          <SplitLines
            as="h1"
            id="hero-title"
            animateNow={booted}
            label={profile.name}
            lines={["Battu", "Dhanush"]}
            className="display text-[clamp(64px,9.4vw,148px)] text-fg"
          />

          <motion.p {...fadeUp(0.55)} className="mt-6 text-[17px] font-medium text-fg">
            {profile.roles[0]} <span className="mx-1.5 text-amber-ink">×</span> {profile.roles[1]}
          </motion.p>
          <motion.p {...fadeUp(0.7)} className="mt-4 max-w-[440px] text-[17px] leading-relaxed text-muted">
            Exploring AI. Building products. Automating ideas. This is my digital lab, a place where curiosity turns into <span data-delay="1.4" className="marker text-fg">real systems</span>.
          </motion.p>

          <motion.div {...fadeUp(0.85)} className="mt-9 flex flex-wrap gap-3">
            <Magnetic
              onClick={() => scrollToId("lab-start")}
              className="group h-12 rounded-full bg-accent px-6 text-[15px] font-semibold text-ink transition-colors hover:bg-fg"
            >
              Play with my projects
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Magnetic>
            <Magnetic
              onClick={() => ui.set({ introOpen: true })}
              className="h-12 rounded-full border border-line-2 bg-ink-2/70 px-6 text-[15px] font-semibold text-fg transition-colors hover:border-fg"
            >
              <span aria-hidden className="inline-block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-amber-ink" />
              Watch the intro
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
