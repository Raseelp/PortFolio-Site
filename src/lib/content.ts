export const profile = {
  name: "Muhammed Raseel P",
  initials: "MR",
  title: "Flutter Developer",
  location: "Calicut, Kerala",
  email: "raseelp321@gmail.com",
  linkedin: "https://linkedin.com/in/connectmeraseel",
  linkedinLabel: "linkedin.com/in/connectmeraseel",
  github: "https://github.com/Raseelp",
  githubLabel: "github.com/Raseelp",
  resume: "/resume.pdf",
  // No real handle yet — omitted from the footer (see Contact.tsx) rather
  // than link out to the generic instagram.com homepage. Set a real
  // profile URL here to bring the link back.
  instagram: null as string | null,
};

// Confirmed production domain — feeds metadataBase (layout.tsx), robots.ts,
// and sitemap.ts, so this is the only place it needs to change. If the site
// goes live first on a GitHub Pages/host URL before this domain is wired up
// via DNS, OG previews and the sitemap will point here until it is.
export const siteUrl = "https://raseel.dev";

// The hero's poetic line isn't one fixed sentence — it cycles through this
// set (see HeroGlow.tsx), starting on a random one and fading to a
// different random one roughly every 30s, so it's never the same read
// twice in a row for someone browsing back to the top.
export const heroQuotes: string[] = [
  "There is no magic. Just another layer of abstraction.",
  "Behind every piece of software is a simple question: what if?",
  "Simplicity is a great virtue but it requires hard work to achieve it.",
  "The best way to predict the future is to invent it.",
];

export const heroCopy = {
  headlinePrefix: "Production Flutter apps by day, native Android internals by",
  headlineEmphasis: "night",
  headlineSuffix: ".",
  subtext:
    "I like starting with a blank screen and figuring out how to turn an idea into something that works. For me, programming is mostly about solving problems, trying things, breaking them, and figuring them out.",
};

export const aboutCopy = {
  paragraph:
    "Flutter has been my main stack for the past few years, with most of my work involving Dart, GetX, REST APIs, and production applications released on both the Play Store and App Store. I've worked closely with .NET backend systems and use Firebase services like Crashlytics, Performance Monitoring, App Check, and FCM in production. I also work with native Android and Kotlin when a project needs it, including MethodChannels and EventChannels for Flutter–native communication. Outside of my main stack, I've worked with Go, Python, C, SQLite, MongoDB, MySQL, Django, and Gin, and I'm comfortable moving between the application layer and the systems underneath it.",
  stats: [
    { value: "1.5 yrs", label: "Professional experience" },
    { value: "~3 yrs", label: "Hands-on with Flutter" },
    { value: "15+", label: "Apps built" },
  ],
};

export interface Project {
  name: string;
  tagline: string;
  description: string;
  date: string;
  stack: string[];
  /** Real, resume-derived facts — not marketing numbers. */
  stats: string[];
  /** Stand-in footage only (free-licensed stock, not the real app) until
   * actual screen recordings replace it — see ProjectMedia.tsx. */
  previewVideo: string;
}

export const projects: Project[] = [
  {
    name: "Local Embedding-Based Media Retrieval Engine",
    tagline:
      "Search your own photos, videos and PDFs by what's actually in them, with nothing leaving the device.",
    description:
      "An offline semantic search system for local images, videos, and PDFs. CLIP's vision and text encoders map both into one embedding space, so a natural-language query matches what's actually depicted or written inside a file, not its filename, entirely on-device.",
    date: "December 2025",
    stack: ["CLIP", "Flutter", "Kotlin", "MethodChannels", "UMAP", "Three.js", "On-device inference"],
    stats: [
      "100% on-device, zero cloud calls",
      "512-dim embeddings reduced to 3D via UMAP",
      "Flutter + Kotlin + Three.js bridge",
      "Cosine similarity ranking over local vectors",
    ],
    previewVideo: "https://videos.pexels.com/video-files/4201543/4201543-sd_640_360_30fps.mp4",
  },
  {
    name: "Context-Aware Notification Assistant",
    tagline: "Turns system notifications into speech, with hardware-level control over when it should shut up.",
    description:
      "A real-time assistant that hooks into Android's NotificationListenerService to catch every notification system-wide, filters duplicates and boilerplate, and speaks what's left through TTS, queued by priority so a burst from one app never turns into a wall of speech.",
    date: "July 2026",
    stack: ["Kotlin", "NotificationListenerService", "Android TTS", "Gesture detection", "Home screen widget"],
    stats: [
      "NotificationListenerService + Android TTS",
      "Priority queue with duplicate & debounce filtering",
      "Hardware gesture stop, works screen-off",
      "Customizable home-screen widget",
    ],
    previewVideo: "https://videos.pexels.com/video-files/7822022/7822022-sd_360_640_30fps.mp4",
  },
];

import type { TechIconSlug } from "./techIcons";

export interface Achievement {
  /** Short, scannable headline — what a reader skimming should catch first. */
  label: string;
  /** The full original sentence, shown as supporting detail. */
  detail: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  dates: string;
  location: string;
  summary?: string;
  subEntries?: {
    name: string;
    tech?: TechIconSlug[];
    achievements: Achievement[];
    links?: { playStore?: string; appStore?: string };
  }[];
  tech?: TechIconSlug[];
  achievements?: Achievement[];
}

export const experience: ExperienceEntry[] = [
  {
    company: "Logiology Solutions",
    role: "Flutter Developer, Full-Time",
    dates: "04/2025 - Present",
    location: "Calicut, Kerala",
    summary:
      "Product-based company delivering jewellery ERP solutions, working on production-grade mobile apps used in real business environments.",
    subEntries: [
      {
        name: "N Vend, Jewellery Sales & Billing App for Salesmen",
        tech: ["getx", "flutter", "dart", "git"],
        achievements: [
          {
            label: "CRM automation",
            detail:
              "Designed and built a complete CRM module, automating activity, opportunity, scheme, and receipt workflows.",
          },
          {
            label: "Multi-tax billing & PDF invoices",
            detail:
              "Handled multi-tax financial calculations (CGST, SGST, IGST, VAT) and PDF invoice generation with custom layouts using the pdf package.",
          },
          {
            label: "RFID stock-taking + ID parsing",
            detail:
              "Integrated RFID-based stock-taking for bulk scanning of tagged inventory with real-time item tracking, plus MRZ and card-data parsing for identity and payment workflows.",
          },
        ],
        links: {
          playStore: "https://play.google.com/store/search?q=n%20vend&c=apps",
          appStore: "https://apps.apple.com/in/app/n-vend/id6477829949",
        },
      },
      {
        name: "N Divo, Jewellery Business Analytics App for Owners",
        tech: ["firebase", "flutter", "dart", "git"],
        achievements: [
          {
            label: "Business dashboards",
            detail:
              "Built and maintained dashboards covering stock, sales, salesmen performance, profits, assets, and liabilities.",
          },
          {
            label: "Multi-branch aggregation",
            detail:
              "Developed a branch-level aggregation module so owners can view combined data across multiple jewellery branches in one place.",
          },
          {
            label: "Biometric security",
            detail: "Added biometric authentication to secure sensitive business and financial data.",
          },
        ],
        links: {
          playStore: "https://play.google.com/store/apps/details?id=com.logiology.ndivo",
          appStore: "https://apps.apple.com/in/app/n-divo/id6504402725",
        },
      },
    ],
  },
  {
    company: "Regional Technologies",
    role: "Flutter Developer Intern",
    dates: "01/2025 - 02/2025",
    location: "Calicut, Kerala",
    subEntries: [
      {
        name: "Emergency Vehicle Priority System",
        tech: ["django", "flutter", "git"],
        achievements: [
          {
            label: "Real-time priority routing",
            detail:
              "Led a team of 4 developers building a real-time emergency vehicle priority system with Flutter and Django, cutting ambulance response times by 30%.",
          },
          {
            label: "Geofencing, SOS & chatbot",
            detail:
              "Built geofencing notifications, SOS requests, and a medical chatbot that lifted user engagement by 20%.",
          },
        ],
      },
    ],
  },
];

export const skillGroups = [
  { label: "Languages", items: ["Dart", "Go", "Python", "Kotlin", "C"] },
  {
    label: "Frameworks & Technologies",
    items: ["Flutter", "Android (Native)", "GetX", "Provider", "Gin", "Django", "REST APIs"],
  },
  { label: "Databases", items: ["SQLite", "MongoDB", "MySQL"] },
  {
    label: "Tools & Platforms",
    items: ["Play Store", "App Store", "Postman", "Git", "Azure DevOps", "GitHub", "Figma", "Notion"],
  },
  {
    label: "Firebase",
    items: ["Crashlytics", "Performance Monitoring", "App Check", "Cloud Messaging"],
  },
];

export const achievement =
  "BR Hackathon, organized by PearAl. Track winner at PearAl (Y Combinator W24).";

export interface EducationEntry {
  degree: string;
  school: string;
  location?: string;
  dates: string;
  note?: string;
}

export const education: EducationEntry[] = [
  {
    degree: "Bachelor of Computer Science",
    school: "College of Applied Science Vazhakkad",
    location: "Malappuram, Kerala",
    dates: "2022 - 2025",
  },
  {
    degree: "Higher Secondary (Computer Science)",
    school: "SSHSS Moorkhanad",
    dates: "2020 - 2022",
    note: "Percentage: 86%",
  },
];

export const navLinks = [
  { href: "#stack", label: "Stack" },
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];
