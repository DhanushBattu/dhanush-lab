"use client";
import { profile } from "@/content/profile";

const FILE = "Battu_Dhanush_Resume.pdf";

type Downloads = { save: (r: { filename: string; data: Blob }) => Promise<unknown> };
type ClaudeHost = { use?: (name: string) => Promise<unknown> };

/**
 * Download the résumé PDF. On a normal host the link's own `download` attribute does the work.
 * Inside the claude.ai preview, plain downloads are blocked, so the file goes through the
 * viewer's save prompt instead. Call from a link's onClick.
 */
export function downloadResume(e?: { preventDefault: () => void }) {
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  if (typeof host?.use !== "function") return; // ordinary site: let the link download
  e?.preventDefault();
  void (async () => {
    try {
      const dl = (await host.use!("downloads")) as Downloads | null;
      const blob = await (await fetch(profile.resumePdf)).blob();
      if (dl) await dl.save({ filename: FILE, data: blob });
      else window.open(profile.resumePdf, "_blank", "noopener");
    } catch {
      /* declined or unavailable: nothing to do */
    }
  })();
}
