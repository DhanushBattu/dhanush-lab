"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  as?: "button" | "a";
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  ariaLabel?: string;
  download?: boolean | string;
  target?: string;
};

/** A button/link that leans toward the cursor. Pure transform — no layout cost. */
export default function Magnetic({ children, className = "", strength = 0.3, as = "button", href, onClick, ariaLabel, download, target }: Props) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  const common = {
    ref: ref as never,
    onPointerMove: move,
    onPointerLeave: leave,
    style: { x: sx, y: sy },
    whileTap: { scale: 0.96 },
    className: `inline-flex items-center justify-center gap-2 ${className}`,
    "aria-label": ariaLabel,
  };

  if (as === "a")
    return (
      <motion.a {...common} href={href} onClick={onClick} download={download} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}>
        {children}
      </motion.a>
    );
  return (
    <motion.button {...common} type="button" onClick={onClick}>
      {children}
    </motion.button>
  );
}
