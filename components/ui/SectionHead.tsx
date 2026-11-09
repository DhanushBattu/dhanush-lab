import { SplitLines } from "./Reveal";

/** A handwritten margin note, as if pencilled next to the section. */
export function Note({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p data-write className={`hand flex items-center gap-2 text-[26px] ${className}`}>
      <svg data-draw viewBox="0 0 40 16" aria-hidden className="h-4 w-10 shrink-0 text-amber-ink">
        <path d="M2 10 C 10 4, 18 14, 26 8 S 34 6, 38 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}

/** Section header: a pencilled note, a display title, and an optional line of context. */
export default function SectionHead({ index, title, kicker, id }: { index: string; title: React.ReactNode[]; kicker?: React.ReactNode; id?: string }) {
  const note = index.replace(/^\d+\s*\/\s*/, "").toLowerCase();
  return (
    <header className="grid gap-6 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <Note className="mb-3">{note}</Note>
        <SplitLines id={id} lines={title} className="display text-[clamp(42px,6.6vw,104px)] outline-none" />
      </div>
      {kicker && <div className="text-[16px] leading-relaxed text-muted md:col-span-4 md:pb-3">{kicker}</div>}
    </header>
  );
}
