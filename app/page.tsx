import SmoothScroll from "@/components/layout/SmoothScroll";
import NotebookMotion from "@/components/layout/NotebookMotion";
import AgentBuild from "@/components/layout/AgentBuild";
import Loader from "@/components/layout/Loader";
import Nav from "@/components/layout/Nav";
import Cursor from "@/components/ui/Cursor";
import Hero from "@/components/hero/Hero";
import Lab from "@/components/sections/Lab";
import ScrollFilm from "@/components/sections/ScrollFilm";
import About from "@/components/sections/About";
import BackgroundDust from "@/components/layout/BackgroundDust";
import ProjectRooms from "@/components/rooms/ProjectRooms";
import Constellation from "@/components/sections/Constellation";
import Education from "@/components/sections/Education";
import Resume from "@/components/sections/Resume";
import Final from "@/components/sections/Final";
import AskAI from "@/components/assistant/AskAI";

/**
 * Story order: IDENTITY → ABOUT → FILM → THE LAB (pick a project — each opens as its own room)
 * → SKILLS → LEARNING → RECORD → IMPACT (final). Projects live in <ProjectRooms/>, off the main scroll.
 */
export default function Page() {
  return (
    <>
      <a href="#lab" className="sr-only z-[200] rounded-full bg-fg px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SmoothScroll />
      <NotebookMotion />
      <AgentBuild />
      <BackgroundDust />
      <Loader />
      <Cursor />
      <div aria-hidden className="cursor-light pointer-events-none fixed inset-0 z-0" />
      <Nav />
      <main className="relative z-[1]">
        <Hero />
        <About />
        <ScrollFilm />
        <Lab />
        <Constellation />
        <Education />
        <Resume />
      </main>
      <Final />
      <ProjectRooms />
      <AskAI />
    </>
  );
}
