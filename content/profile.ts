/**
 * DHANUSH LAB — single source of truth for every word on the site.
 * Everything here comes from Dhanush's brief and resume.
 * Items marked `placeholder: true` are clearly-labelled slots to fill in later.
 */
export const profile = {
  name: "Battu Dhanush",
  first: "BATTU",
  last: "DHANUSH",
  handle: "BATTU_DHANUSH",
  roles: ["Software Development Engineer", "Full-Stack & AI/ML"],
  location: "Bengaluru, Karnataka, India",
  tagline: "Inside the mind of an AI/ML builder.",
  intro: "Exploring AI. Building products. Automating ideas. This is my digital lab — a place where curiosity turns into real systems.",
  email: "dhanushbattu1234@gmail.com",
  github: "https://github.com/DhanushBattu",
  linkedin: "https://www.linkedin.com/in/dhanush-battu-263089301",
  resumePdf: "resume/Battu_Dhanush_Resume.pdf",
  summary: "Software engineer specializing in full-stack web, cross-platform mobile and machine-learning applications, with hands-on delivery across Java, Python, JavaScript and Dart. Strong foundation in data structures, algorithms, OOP and DBMS, applied to real-world problems such as LLM fact-checking, transaction-safe bookings and workflow automation.",
  interests: ["Inline skating", "Chess: plays and solves puzzles on Chess.com, rated 1500", "Gaming, and following competitive esports tournaments"],
  repos: {
    veriai: "https://github.com/DhanushBattu/verification-ai-v2",
    rental: "https://github.com/DhanushBattu/Rental_main",
    ipl: "https://github.com/DhanushBattu/IPL-Predictor-Analytics",
  },
};
export const education = [
  {
    year: "2023–2027 (expected)",
    title: "B.E. Artificial Intelligence & Machine Learning",
    place: "BMS Institute of Technology & Management",
    meta: "Bengaluru · CGPA 8.0",
  },
  {
    year: "2023–Present",
    title: "B.Sc. Mathematics for Data Science",
    place: "IIT Madras",
    meta: "Online",
  },
  {
    year: "2021–2023",
    title: "Intermediate (Science Stream)",
    place: "Sri Abhida (TSBIE)",
    meta: "Telangana · 92%",
  },
  {
    year: "Class X",
    title: "Secondary School (Class X) — CBSE",
    place: "St. Peter's Model School",
    meta: "Telangana",
  },
];
export const experience = {
  index: "01 / REAL WORLD",
  title: "AI AUTOMATION",
  org: "Elite IIT",
  role: "Software Developer (Freelance): AI Digital Marketing Assistant & Marketing Automation Workflow",
  mode: "Freelance · Bengaluru",
  points: [
    "Engineered a Meta-compliant WhatsApp Business API automation platform",
    "Integrated a bilingual Generative AI assistant for localized content",
    "Built edtech-style visual generation workflows",
    "Drove results through campaign segmentation and prompt engineering",
  ],
  pipeline: [
    {
      id: "campaign",
      label: "CAMPAIGN",
      note: "A marketing goal becomes a structured campaign — the input to the whole system.",
    },
    {
      id: "segment",
      label: "SEGMENTATION",
      note: "Audiences are split into targeted segments so each message fits who receives it.",
    },
    {
      id: "prompt",
      label: "PROMPT",
      note: "Prompt engineering turns each segment's context into precise instructions for the model.",
    },
    {
      id: "genai",
      label: "GENERATIVE AI",
      note: "A bilingual Generative AI assistant produces localized content and edtech-style visuals.",
    },
    {
      id: "whatsapp",
      label: "WHATSAPP API",
      note: "Delivered through a Meta-compliant WhatsApp Business API automation platform.",
    },
    {
      id: "user",
      label: "USER",
      note: "The message lands — localized, on-brand, and measurable.",
    },
  ],
  impact: [
    {
      value: 32,
      label: "WHATSAPP ENGAGEMENT",
    },
    {
      value: 70,
      label: "CONTENT CREATION SPEED",
    },
    {
      value: 40,
      label: "MARKETING EFFICIENCY",
    },
  ],
};
export const rental = {
  index: "BUILD 01",
  title: "CROSS-PLATFORM RENTAL APP",
  platforms: ["WEB", "iOS", "ANDROID"],
  stack: ["Flutter", "Dart", "Firebase", "Cloud Firestore", "FCM"],
  summary: "A cross-platform marketplace built with Flutter and Dart, backed by a secure Cloud Firestore architecture with multilingual support.",
  flow: [
    {
      id: "user",
      label: "USER",
      note: "A renter or owner opens the app on Web, iOS or Android — one Flutter codebase, multilingual architecture.",
    },
    {
      id: "kyc",
      label: "KYC",
      note: "Sensitive identity (KYC) workflows are protected by the Firestore security model before any listing or booking.",
    },
    {
      id: "role",
      label: "ROLE VALIDATION",
      note: "Custom Role-Based Access Control (RBAC) decides what each role can read and write.",
    },
    {
      id: "avail",
      label: "AVAILABILITY",
      note: "Inventory availability is read at the moment of booking — not trusted from a stale client.",
    },
    {
      id: "txn",
      label: "TRANSACTION",
      note: "Strict database transaction rules make the booking atomic, eliminating inventory double-booking.",
    },
    {
      id: "pay",
      label: "PAYMENT",
      note: "The payment pipeline only proceeds on a committed, consistent booking.",
    },
    {
      id: "notify",
      label: "NOTIFICATION",
      note: "Firebase Cloud Messaging + Web Service Workers deliver alerts in foreground, background and terminated states.",
    },
  ],
  systems: [
    {
      k: "FIREBASE",
      v: "App platform",
    },
    {
      k: "FIRESTORE",
      v: "Secure backend",
    },
    {
      k: "FCM",
      v: "All app states",
    },
    {
      k: "RBAC",
      v: "Custom roles",
    },
    {
      k: "KYC",
      v: "Protected flows",
    },
  ],
};
export const veriai = {
  title: "VeriAI",
  subtitle: "AI Hallucination Verification System · B.E. major project (team of 4)",
  stack: ["Python", "FastAPI", "React", "TypeScript", "PyTorch", "Hugging Face Transformers", "Claude API"],
  summary: "A chat app that fact-checks every claim in an AI answer against Wikipedia, Wikidata, Crossref and OpenAlex, flagging wrong claims and catching fabricated papers and books.",
  sources: ["Wikipedia", "Wikidata", "Crossref", "OpenAlex"],
  pipeline: [
    { id: "split", label: "CLAIM SPLITTING", note: "The AI answer is split into separate, checkable claims." },
    { id: "nli", label: "NLI GATE", note: "A natural-language-inference faithfulness gate filters claims before they are checked." },
    { id: "retrieve", label: "RETRIEVAL", note: "BM25 + cross-encoder retrieval pulls evidence from Wikipedia, Wikidata, Crossref and OpenAlex." },
    { id: "judge", label: "LLM JUDGE", note: "A quote-verified LLM judge decides each claim. No verdict is accepted without a cited source." },
    { id: "correct", label: "CORRECTION", note: "Wrong claims get corrections that are re-checked by the system itself." },
  ],
  extras: ["Self-rechecked corrections", "Live news with freshness filtering", "Multi-LLM fallback", "141 automated tests"],
};

export const cafe = {
  index: "BUILD 02",
  title: "CYBER CAFÉ MANAGEMENT SYSTEM",
  stack: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
  summary:
    "A full-stack web app that automates session tracking, computer allocation and billing, on a relational MySQL schema with secure authentication and real-time monitoring dashboards.",
  features: ["Session tracking", "Computer allocation", "Admin management", "Authentication", "CRUD", "Billing records", "Live dashboard", "Usage logs & reports"],
};
export const ipl = {
  index: "BUILD 03",
  title: "IPL INTELLIGENCE",
  subtitle: "Match Analytics & Winner Prediction · 2008–2024",
  stack: ["Python", "Pandas", "NumPy", "Scikit-learn", "Flask", "SQLite", "Matplotlib", "Seaborn", "Git"],
  summary: "Analyzed 1,095 IPL matches (2008–2024) to surface team, toss and player-performance trends, then built a Flask web app with SQLite-backed authentication that serves predictions from six ML models.",
  models: ["Logistic Regression", "Decision Tree", "Random Forest", "KNN", "Gaussian Naive Bayes", "Linear Regression"],
};
export type Tech = { id: string; label: string; group: "language" | "library" | "tool" | "project"; used: string[] };

/** Core skills (inner orbit) + project stack from the resume (outer orbit). */
export const tech: Tech[] = [
  {
    id: "python",
    label: "PYTHON",
    group: "language",
    used: ["VeriAI: FastAPI verification pipeline", "IPL Intelligence: analytics & six ML models", "Data work with Pandas & NumPy"],
  },
  {
    id: "java",
    label: "JAVA",
    group: "language",
    used: ["Alpha: DSA with Java (Apna College)"],
  },
  {
    id: "sql",
    label: "SQL",
    group: "language",
    used: ["Cyber Café: centralized MySQL database", "IPL Intelligence: SQLite authentication"],
  },
  {
    id: "js",
    label: "JAVASCRIPT",
    group: "language",
    used: ["Cyber Café: real-time monitoring dashboard"],
  },
  {
    id: "ts",
    label: "TYPESCRIPT",
    group: "language",
    used: ["VeriAI: React chat front end"],
  },
  {
    id: "html",
    label: "HTML",
    group: "language",
    used: ["Cyber Café web app", "IPL Intelligence dashboards"],
  },
  {
    id: "css",
    label: "CSS",
    group: "language",
    used: ["Cyber Café web app", "IPL Intelligence dashboards"],
  },
  {
    id: "pandas",
    label: "PANDAS",
    group: "library",
    used: ["IPL Intelligence: 1,095 matches analyzed"],
  },
  {
    id: "numpy",
    label: "NUMPY",
    group: "library",
    used: ["IPL Intelligence: numerical analysis"],
  },
  {
    id: "matplotlib",
    label: "MATPLOTLIB",
    group: "library",
    used: ["IPL Intelligence: visualizations"],
  },
  {
    id: "seaborn",
    label: "SEABORN",
    group: "library",
    used: ["IPL Intelligence: statistical plots"],
  },
  {
    id: "mysql",
    label: "MYSQL",
    group: "tool",
    used: ["Cyber Café: users, systems & billing records"],
  },
  {
    id: "git",
    label: "GIT",
    group: "tool",
    used: ["IPL Intelligence: version control", "Code on github.com/DhanushBattu"],
  },
  {
    id: "github",
    label: "GITHUB",
    group: "tool",
    used: ["github.com/DhanushBattu"],
  },
  {
    id: "fastapi",
    label: "FASTAPI",
    group: "project",
    used: ["VeriAI: verification API"],
  },
  {
    id: "react",
    label: "REACT",
    group: "project",
    used: ["VeriAI: chat app"],
  },
  {
    id: "pytorch",
    label: "PYTORCH",
    group: "project",
    used: ["VeriAI: NLI gate and cross-encoder models"],
  },
  {
    id: "hf",
    label: "HUGGING FACE",
    group: "project",
    used: ["VeriAI: Transformers models"],
  },
  {
    id: "flutter",
    label: "FLUTTER",
    group: "project",
    used: ["Rental App: Web, iOS & Android from one codebase"],
  },
  {
    id: "dart",
    label: "DART",
    group: "project",
    used: ["Rental App"],
  },
  {
    id: "firebase",
    label: "FIREBASE",
    group: "project",
    used: ["Rental App: Cloud Firestore, RBAC rules, FCM"],
  },
  {
    id: "php",
    label: "PHP",
    group: "project",
    used: ["Cyber Café: full-stack backend"],
  },
  {
    id: "flask",
    label: "FLASK",
    group: "project",
    used: ["IPL Intelligence: prediction platform"],
  },
  {
    id: "sklearn",
    label: "SCIKIT-LEARN",
    group: "project",
    used: ["IPL Intelligence: six ML models"],
  },
];
export const achievements = {
  highlight: [
    {
      title: "TECH QUIZ WINNER",
      sub: "Bengaluru Tech Summit · Dec 2023",
      note: "Recognized for technical knowledge and problem-solving.",
    },
  ],
  certs: [
    {
      org: "IBM",
      name: "IBM",
      title: "Introduction to Generative AI (MDL-388)",
    },
    {
      org: "APNA COLLEGE",
      name: "Apna College",
      title: "Alpha — DSA with Java",
    },
    {
      org: "INFOSYS SPRINGBOARD",
      name: "Infosys",
      title: "Python Fundamentals",
    },
  ],
};
export const availability = ["Software Development", "AI/ML"];
/** "About me": everything here is in Dhanush's own words, lightly edited. */
export const aboutMe = [
  {
    id: "roots",
    tag: "roots",
    title: "Bengaluru, with Hyderabad roots",
    body: "I'm based in Bengaluru, and my family ties run back to Hyderabad.",
    hand: "BLR ↔ HYD",
  },
  {
    id: "events",
    tag: "events",
    title: "Running the big events",
    body: "Co-Head of my college's main event. At Utsaha Vaibhava, our annual fest, I was operations manager for the flagship inter-college debate tournament, and I judge institutional tournaments as an expert adjudicator.",
    hand: "Utsaha Vaibhava",
  },
  {
    id: "play",
    tag: "skates & chess",
    title: "Inline skates and a chessboard",
    body: "I've logged a lot of hours on inline skates. To keep my thinking sharp I play and solve puzzles on Chess.com, and I game and follow competitive esports tournaments closely.",
    hand: "1500 on Chess.com",
  },
  {
    id: "trips",
    tag: "how I travel",
    title: "In the moment, with friends",
    body: "Living a moment matters more to me than capturing it, so my camera roll stays small. I'd rather go with friends than alone: Goa and Pondicherry with school friends, trips outdoors, and night rides on the motorcycle.",
    hand: "Goa · Pondicherry · night rides",
  },
] as const;

export const navItems = [
  {
    id: "about",
    label: "ABOUT",
  },
  {
    id: "lab",
    label: "PROJECTS",
  },
  {
    id: "skills",
    label: "SKILLS",
  },
  {
    id: "education",
    label: "LEARNING",
  },
  {
    id: "resume",
    label: "RESUME",
  },
  {
    id: "contact",
    label: "CONTACT",
  },
];
