/**
 * DHANUSH AI — a grounded, on-device answer engine.
 * It only ever answers from content/profile.ts. No network calls, no model, no invented facts:
 * if nothing in the portfolio matches, it says so.
 *
 * To upgrade later: send the same knowledge base as context to an LLM API route and keep
 * the "answer only from this" instruction — the UI doesn't need to change.
 */
import { aboutMe, achievements, availability, cafe, education, experience, ipl, profile, rental, tech, veriai } from "@/content/profile";

export type Answer = { lines: string[]; source: string };

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

type Intent = { id: string; words: string[]; answer: () => Answer };

const intents: Intent[] = [
  {
    id: "veriai",
    words: ["veriai", "verif", "hallucination", "fact-check", "fact check", "claim", "wikipedia", "wikidata", "crossref", "openalex", "fastapi", "pytorch", "hugging", "llm", "nli", "major project"],
    answer: () => ({
      source: "builds/veriai",
      lines: [
        `VERIAI: AI HALLUCINATION VERIFICATION — ${veriai.stack.join(" · ")}`,
        "→ B.E. major project, built in a team of 4.",
        "→ A chat app that fact-checks every claim in an AI answer against Wikipedia, Wikidata, Crossref and OpenAlex, flagging wrong claims and catching fabricated papers and books.",
        "→ Pipeline: claim splitting with an NLI faithfulness gate, BM25 + cross-encoder evidence retrieval, and a quote-verified LLM judge. No verdict is accepted without a cited source.",
        "→ Self-rechecked corrections, live news with freshness filtering, multi-LLM fallback, backed by 141 automated tests.",
        `Code → ${profile.repos.veriai.replace("https://", "")}`,
      ],
    }),
  },
  {
    id: "rental",
    words: ["rental", "flutter", "dart", "firebase", "firestore", "kyc", "rbac", "booking", "marketplace", "fcm", "double"],
    answer: () => ({
      source: "builds/rental-app",
      lines: [
        "CROSS-PLATFORM RENTAL APP — Flutter · Dart · Firebase · Cloud Firestore · FCM",
        "→ Built a marketplace for Web, iOS and Android with a multilingual architecture.",
        "→ Architected a secure Cloud Firestore backend with custom Role-Based Access Control (RBAC) protecting KYC workflows.",
        "→ Eliminated inventory double-booking with strict database transaction rules, securing the payment pipeline.",
        "→ Delivered critical alerts in foreground, background and terminated states using FCM and Web Service Workers.",
        `Code → ${profile.repos.rental.replace("https://", "")}`,
      ],
    }),
  },
  {
    id: "cafe",
    words: ["cafe", "café", "cyber", "php", "session tracking", "billing", "allocation"],
    answer: () => ({
      source: "builds/cyber-cafe",
      lines: [
        `CYBER CAFÉ MANAGEMENT SYSTEM — ${cafe.stack.join(" · ")}`,
        "→ Full-stack web app for automated session tracking, computer allocation and admin management.",
        "→ Centralized MySQL database with secure authentication and CRUD for users, systems and billing records.",
        "→ Real-time monitoring dashboards for active sessions, usage logs and system reports.",
      ],
    }),
  },
  {
    id: "ipl",
    words: ["ipl", "cricket", "match", "prediction", "predict", "scikit", "sklearn", "flask", "sqlite", "machine learning model", "models"],
    answer: () => ({
      source: "builds/ipl-intelligence",
      lines: [
        `IPL INTELLIGENCE — ${ipl.stack.join(" · ")}`,
        "→ Analyzed 1,095 IPL matches (2008–2024) to surface team, toss and player-performance trends.",
        `→ Built a Flask prediction platform with SQLite authentication and six ML models: ${ipl.models.join(", ")}.`,
        `Code → ${profile.repos.ipl.replace("https://", "")}`,
      ],
    }),
  },
  {
    id: "impact",
    words: ["impact", "result", "numbers", "engagement", "percent", "%", "metric", "achieve at elite", "efficiency"],
    answer: () => ({
      source: "experience/elite-iit",
      lines: ["Measured impact at Elite IIT:", ...experience.impact.map((m) => `→ +${m.value}% ${m.label.toLowerCase()}`), "Driven by targeted campaign segmentation and prompt engineering."],
    }),
  },
  {
    id: "experience",
    words: ["experience", "work", "job", "intern", "freelance", "elite", "whatsapp", "marketing", "automation", "generative", "genai", "gen ai", "prompt"],
    answer: () => ({
      source: "experience/elite-iit",
      lines: [
        `${experience.role} — ${experience.org} (${experience.mode})`,
        ...experience.points.map((p) => `→ ${p}.`),
        `Impact: +32% WhatsApp engagement · +70% content creation speed · +40% marketing efficiency.`,
      ],
    }),
  },
  {
    id: "projects",
    words: ["project", "built", "build", "made", "make", "portfolio work", "what has he done"],
    answer: () => ({
      source: "builds/*",
      lines: [
        "Four builds are on record, plus the Elite IIT client work:",
        "01 → VeriAI (Python, FastAPI, React, PyTorch) — fact-checks every claim in an AI answer against cited sources.",
        "02 → Cross-Platform Rental App (Flutter, Firebase) — RBAC, KYC, transaction-safe bookings, FCM.",
        "03 → Cyber Café Management System (PHP, MySQL) — sessions, allocation, billing, live dashboard.",
        "04 → IPL Intelligence (Python, Scikit-learn, Flask) — 1,095 matches analyzed, six ML models.",
        "Ask about any one of them for details.",
      ],
    }),
  },
  {
    id: "learning",
    words: ["learning", "currently", "right now", "studying now", "next"],
    answer: () => ({
      source: "education",
      lines: [
        "Currently learning → B.Sc. Mathematics for Data Science at IIT Madras (online), alongside the B.E. in AI & ML at BMS Institute of Technology & Management (2023–2027, expected).",
        "Right now he's building DHANUSH LAB — this portfolio — as a working product.",
      ],
    }),
  },
  {
    id: "education",
    words: ["education", "study", "studies", "college", "degree", "bmsit", "bms", "iit", "madras", "cgpa", "gpa", "university", "graduat", "school"],
    answer: () => ({
      source: "education",
      lines: education.map((e) => `→ ${e.title} — ${e.place} (${e.year}) · ${e.meta}`),
    }),
  },
  {
    id: "achievements",
    words: ["award", "achievement", "win", "won", "quiz", "summit", "cert", "ibm", "apna", "infosys", "recognition", "founder"],
    answer: () => ({
      source: "achievements",
      lines: [
        "→ Tech Quiz Winner — Bengaluru Tech Summit (Dec 2023).",
        ...achievements.certs.map((c) => `→ Certification: ${c.title} — ${c.name}.`),
      ],
    }),
  },
  {
    id: "contact",
    words: ["contact", "email", "reach", "hire", "github", "linkedin", "available", "availability", "internship", "open to", "connect"],
    answer: () => ({
      source: "contact",
      lines: [`Available for roles in ${availability.join(" and ")}.`, `Email → ${profile.email}`, `GitHub → ${profile.github.replace("https://", "")}`, `LinkedIn → ${profile.linkedin.replace("https://www.", "")}`],
    }),
  },
  {
    id: "resume",
    words: ["resume", "cv", "pdf"],
    answer: () => ({ source: "resume", lines: ["One-page resume: AI/ML · Software · Data.", `Download → ${profile.resumePdf}`] }),
  },
  {
    id: "interests",
    words: ["hobby", "hobbies", "interest", "free time", "spare time", "outside work", "skate", "skating", "chess", "puzzle", "esport", "gaming", "games"],
    answer: () => ({ source: "about-me", lines: ["Off the screen:", ...profile.interests.map((x) => `  → ${x}`)] }),
  },
  {
    id: "events",
    words: ["event", "fest", "utsaha", "vaibhava", "debate", "adjudicat", "co-head", "co head", "organis", "organiz", "leadership"],
    answer: () => ({ source: "about-me", lines: ["In his words:", aboutMe[1].body] }),
  },
  {
    id: "roots",
    words: ["hyderabad", "hometown", "where is he from", "from where", "family", "roots"],
    answer: () => ({ source: "about-me", lines: [aboutMe[0].body.replace("I'm", "He's").replace("my family", "his family")] }),
  },
  {
    id: "trips",
    words: ["travel", "trip", "goa", "pondicherry", "ride", "motorcycle", "bike", "photos", "adventure"],
    answer: () => ({ source: "about-me", lines: ["In his words:", aboutMe[3].body] }),
  },
  {
    id: "about",
    words: ["who", "about", "introduce", "summary", "tell me about dhanush", "dhanush"],
    answer: () => ({
      source: "profile",
      lines: [`${profile.name} — ${profile.roles.join(" × ")}, based in Bengaluru.`, profile.summary, "B.E. AI & ML at BMSIT (CGPA 8.0) and B.Sc. Mathematics for Data Science at IIT Madras."],
    }),
  },
];

const techIntent = (q: string): Answer | null => {
  const hit = tech.filter((t) => {
    const l = t.label.toLowerCase();
    const alts = [l, t.id, l.replace("/", " ")];
    return alts.some((a) => new RegExp(`(^|[^a-z])${a.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}([^a-z]|$)`).test(q));
  });
  if (!hit.length) return null;
  return {
    source: "tech-constellation",
    lines: hit.flatMap((t) => [`${t.label}`, ...t.used.filter((u) => !u.startsWith("[")).map((u) => `  → ${u}`), ...(t.used.every((u) => u.startsWith("[")) ? ["  → Listed as a skill; no specific project is recorded for it yet."] : [])]),
  };
};

const skillsAnswer = (): Answer => {
  const g = (k: string) => tech.filter((t) => t.group === k).map((t) => t.label).join(", ");
  return {
    source: "tech-constellation",
    lines: [`Languages → ${g("language")}`, `Libraries → ${g("library")}`, `Tools → ${g("tool")}`, `Project stacks → ${g("project")}`],
  };
};

export function ask(raw: string): Answer {
  const q = ` ${raw.toLowerCase().trim()} `;
  if (!raw.trim()) return { source: "system", lines: ["Type a question about Dhanush's work."] };

  // "what technologies does he use" → full stack; "where did he use python" → specific
  const specificTech = techIntent(q);
  const wantsSkills = has(q, ["technolog", "skill", "stack", "tools", "languages", "frameworks", "libraries"]) && !has(q, ["quiz", "summit"]);
  if (specificTech && !has(q, ["rental", "cafe", "café", "ipl"])) return specificTech;
  if (wantsSkills) return skillsAnswer();

  let best: Intent | null = null;
  let score = 0;
  for (const it of intents) {
    const s = it.words.reduce((acc, w) => acc + (q.includes(w) ? (w.length > 5 ? 2 : 1) : 0), 0);
    if (s > score) {
      score = s;
      best = it;
    }
  }
  if (best && score > 0) return best.answer();
  if (specificTech) return specificTech;

  return {
    source: "none",
    lines: [
      "That isn't in the portfolio records — and I only answer from them, so I won't guess.",
      "Try: projects · rental app · experience · technologies · education · what he's learning · contact.",
    ],
  };
}

export const suggestions = [
  "What projects has Dhanush built?",
  "How does VeriAI catch hallucinations?",
  "What did he contribute to the rental application?",
  "What technologies does he use?",
  "Tell me about his experience.",
  "What is he currently learning?",
];

export const kbStats = `1 real-world project · 4 builds · ${tech.length} technologies · ${rental.flow.length}-stage architecture`;
