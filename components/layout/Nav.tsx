"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { navItems } from "@/content/profile";
import { scrollToId, lockScroll } from "@/lib/scroll";
import { ui, useUI } from "@/lib/store";

const nice = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function Nav() {
  const booted = useUI((s) => s.booted);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  // active section highlighting
  useEffect(() => {
    const ids = navItems.map((n) => n.id);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollToId(id), open ? 250 : 0);
  };

  return (
    <>
      {/* scroll progress */}
      <motion.div
        aria-hidden
        className="fixed left-0 right-0 top-0 z-[70] h-[3px] origin-left bg-amber"
        style={{ scaleX: progress }}
      />

      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={booted ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      >
        <nav
          aria-label="Primary"
          className="flex w-full max-w-[1180px] items-center justify-between rounded-full border border-line-2 bg-ink-2/95 py-2 pl-5 pr-2 shadow-[0_10px_30px_-20px_rgba(40,30,15,.5)]"
        >
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("top");
            }}
            className="flex items-center gap-2 font-display text-[16px] font-bold tracking-[-0.01em]"
          >
            <span className="inline-block h-2.5 w-2.5 rotate-12 rounded-[2px] bg-amber" />
            Dhanush Lab
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(n.id);
                  }}
                  aria-current={active === n.id ? "true" : undefined}
                  className={`relative rounded-full px-3 py-2 text-[14px] font-medium transition-colors hover:bg-ink-3/70 hover:text-fg ${
                    active === n.id ? "text-fg" : "text-muted"
                  }`}
                >
                  {active === n.id && (
                    <motion.span layoutId="nav-dot" className="absolute inset-x-3 bottom-1 h-[3px] rounded-full bg-amber" />
                  )}
                  {n.id === "lab" ? (
                    <span className="inline-flex items-center gap-1.5 text-fg">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {nice(n.label)}
                    </span>
                  ) : (
                    nice(n.label)
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => ui.set({ assistantOpen: true })}
              className="rounded-full bg-fg px-4 py-2 text-[14px] font-semibold text-ink transition-colors hover:bg-accent"
            >
              Ask AI
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-2.5 w-4">
                <span className={`absolute left-0 h-px w-4 bg-fg transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-4 bg-fg transition-transform ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-6 pb-10 pt-28 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-1">
              {navItems.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={`#${n.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(n.id);
                    }}
                    className="flex items-baseline gap-4 py-1"
                  >
                    <span className="display text-[13vw] leading-[1.02]">{nice(n.label)}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="hand text-[26px]">Battu Dhanush · AI/ML · Bengaluru</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
