"use client";
import { motion, type Variants } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

/** Scroll-triggered fade/slide. */
export function Reveal({ children, delay = 0, className = "", y = 28 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

const lineV: Variants = {
  hidden: { y: "105%" },
  show: (i: number) => ({ y: "0%", transition: { duration: 1.05, delay: i * 0.08, ease } }),
};

/**
 * Line-by-line masked text reveal. Each line slides up from behind a mask.
 * Screen readers get the full sentence once via aria-label.
 */
export function SplitLines({
  lines,
  className = "",
  lineClassName = "",
  as: Tag = "h2",
  animateNow,
  delay = 0,
  id,
  label: labelOverride,
}: {
  id?: string;
  label?: string;
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  as?: "h1" | "h2" | "h3" | "p";
  animateNow?: boolean;
  delay?: number;
}) {
  const label = labelOverride ?? lines.map((l) => (typeof l === "string" ? l : "")).join(" ");
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      id={id}
      className={className}
      aria-label={label || undefined}
      initial="hidden"
      {...(animateNow === undefined
        ? { whileInView: "show", viewport: { once: true, margin: "-8% 0px" } }
        : { animate: animateNow ? "show" : "hidden" })}
    >
      {lines.map((l, i) => (
        <span key={i} className="-my-[0.12em] block overflow-hidden py-[0.12em]" aria-hidden>
          <motion.span className={`block ${lineClassName}`} variants={lineV} custom={i + delay * 10}>
            {l}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
