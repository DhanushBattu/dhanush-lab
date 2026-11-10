import { faq } from "@/content/faq";
import { Note } from "@/components/ui/SectionHead";

/**
 * Plain, quotable answers about Dhanush. Rendered as static HTML (no client JS needed),
 * so search engines and AI assistants can read every word even without running scripts.
 * The same text feeds the FAQPage structured data in app/layout.tsx.
 */
export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative pb-8 pt-20 md:pb-12 md:pt-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Note className="mb-3">in short</Note>
        <h2 id="faq-title" className="display text-[clamp(38px,5vw,72px)] outline-none">
          Dhanush Battu, <span className="marker">in short.</span>
        </h2>
        <p data-reveal className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-muted">
          The short version, for anyone in a hurry.
        </p>

        <ul data-build-group className="mt-12 grid gap-x-12 border-t border-line md:mt-14 md:grid-cols-2">
          {faq.map((f, i) => (
            <li key={f.q} data-build={`answer · 0${i + 1}`} className="border-b border-line py-7">
              <div className="flex items-baseline gap-4">
                <span aria-hidden className="hand w-8 shrink-0 text-[22px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-[21px] font-bold leading-snug tracking-[-0.015em]">{f.q}</h3>
              </div>
              <p className="mt-3 pl-12 text-[15.5px] leading-relaxed text-muted">{f.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
