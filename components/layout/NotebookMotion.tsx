"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ui } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/**
 * The page's motion language, all borrowed from a real notebook and run by GSAP:
 *  - pencil strokes ([data-draw] paths) draw themselves as they scroll in (DrawSVG)
 *  - handwritten notes (.hand[data-write]) appear left to right, as if being written
 *  - highlighter strokes (.marker) sweep across their words
 *  - taped-on paper ([data-stick]) drops onto the page and settles
 *  - blocks of text ([data-reveal]) rise in, and headings ([data-parallax]) drift slower than the page
 * Everything here is skipped for visitors who prefer reduced motion: the page is then
 * simply shown in its final state.
 */
export default function NotebookMotion() {
  useEffect(() => {
    let mm: gsap.MatchMedia | null = null;

    const start = () => {
      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const once = { start: "top 88%", once: true } as const;

        // pencil strokes
        gsap.utils.toArray<SVGPathElement>("[data-draw] path:not([stroke-dasharray]), path[data-draw]").forEach((p) => {
          gsap.fromTo(
            p,
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 1.1, ease: "power2.inOut", scrollTrigger: { trigger: p.closest("svg") ?? p, ...once } },
          );
        });

        // handwriting: a left-to-right wipe
        gsap.utils.toArray<HTMLElement>(".hand[data-write]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(-20% 100% -20% 0%)" },
            { clipPath: "inset(-20% 0% -20% 0%)", duration: 0.9, ease: "power1.inOut", delay: 0.15, scrollTrigger: { trigger: el, ...once } },
          );
        });

        // highlighter
        gsap.utils.toArray<HTMLElement>(".marker").forEach((el) => {
          gsap.fromTo(
            el,
            { backgroundSize: "0% 100%" },
            { backgroundSize: "100% 100%", duration: 0.75, ease: "power2.out", delay: Number(el.dataset.delay ?? 0.35), scrollTrigger: { trigger: el, ...once } },
          );
        });

        // taped-on paper: drops in a little rotated, then settles
        ScrollTrigger.batch("[data-stick]", {
          start: "top 90%",
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { y: -28, rotation: (i) => (i % 2 ? 2.5 : -2.5), scale: 1.03, autoAlpha: 0 },
              { y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "back.out(1.6)", stagger: 0.08, clearProps: "transform" },
            ),
        });
        // hide them until their turn (only when motion is on, so nothing is lost without JS)
        gsap.set("[data-stick]", { autoAlpha: 0 });

        // plain blocks of text: rise in softly
        gsap.set("[data-reveal]", { autoAlpha: 0, y: 22 });
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, clearProps: "transform" }),
        });

        // parallax: headings drift a little slower than the page ([data-parallax] = distance in px)
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const d = Number(el.dataset.parallax) || 24;
          gsap.fromTo(el, { y: d }, { y: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        });
        ScrollTrigger.refresh();
      });
    };

    // wait for the loader to finish, so the first strokes happen in front of the visitor
    if (ui.get().booted) start();
    const off = ui.subscribe(() => {
      if (ui.get().booted && !mm) start();
    });

    return () => {
      off();
      mm?.revert();
    };
  }, []);

  return null;
}
