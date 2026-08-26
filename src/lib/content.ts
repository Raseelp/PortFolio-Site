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
};

export const heroCopy = {
  headlinePrefix: "Production Flutter apps by day, native Android internals by",
  headlineEmphasis: "night",
  headlineSuffix: ".",
  subtext:
    "I ship cross-platform jewellery ERP apps used by real businesses, and build offline machine learning and audio systems on the side.",
};

export const aboutCopy = {
  paragraph:
    "I'm a Flutter developer with about a year and a half of professional experience and close to three years of hands-on time with the framework. Most of my day job is GetX state management, REST API integration, and testing everything through Postman before it ships. I work closely with a .NET backend team, and outside of work I've been teaching myself Go and MongoDB to see the other side of the stack. I rely on Firebase in production, mainly Crashlytics and Performance Monitoring, to keep apps stable once real users are on them, and I've taken cross-platform apps through full release cycles on both the Play Store and the App Store.",
  stats: [
    { value: "1.5 yrs", label: "Professional experience" },
    { value: "~3 yrs", label: "Hands-on with Flutter" },
    { value: "2", label: "Apps in production" },
  ],
};

export const featuredProject = {
  name: "Local Embedding-Based Media Retrieval Engine",
  tagline: "Search your own photos, videos and PDFs by what's actually in them, with nothing leaving the device.",
  date: "December 2025",
  stack: [
    "CLIP",
    "Flutter",
    "Kotlin",
    "MethodChannels",
    "UMAP",
    "Three.js",
    "On-device inference",
  ],
  sections: [
    {
      heading: "Problem",
      body: "Finding a specific photo, video, or PDF on my phone always meant scrolling through folders or hoping I remembered the filename. Cloud photo search solves this by uploading everything to a server first. I wanted the same natural-language search, but entirely on-device, with nothing ever leaving the phone.",
    },
    {
      heading: "Approach",
      body: "CLIP's vision and text encoders map images and text queries into the same embedding space, so a query like \"the receipt from the electronics store\" can match against the actual pixels of a photo, not just its filename. Every step of that, encoding, indexing, and ranking, runs through a local inference pipeline, so a search never triggers a network call.",
    },
    {
      heading: "What I built",
      body: "The core is a Flutter app with a background indexing pipeline, plus a Kotlin layer that runs the CLIP encoders and handles the heavier on-device inference. I bridged Flutter and Kotlin with MethodChannels and EventChannels to stream indexing progress back to the UI in real time, then ranked results with cosine similarity over the stored vectors. For the visualization layer, I reduced the 512-dimensional embeddings to 3D with UMAP and built a Three.js scene, wired through a second Flutter-Kotlin-Three.js bridge, so you can actually see how your own media clusters by meaning.",
    },
    {
      heading: "What was hard",
      body: "The hardest part was never the model, it was the plumbing. Getting CLIP inference fast enough on-device without blocking the UI thread took careful work on the Kotlin side, and keeping three different runtimes, Flutter, native Kotlin, and a Three.js scene, in sync over channel messages took more debugging than the retrieval logic itself did.",
    },
  ],
};

export const otherProject = {
  name: "Context-Aware Notification Assistant",
  tagline: "Turns system notifications into speech, with hardware-level control over when it should shut up.",
  date: "July 2026",
  stack: [
    "Kotlin",
    "NotificationListenerService",
    "Android TTS",
    "Gesture detection",
    "Home screen widget",
  ],
  body: [
    "I hook into Android's NotificationListenerService to catch every notification system-wide, then run it through a pipeline that filters duplicates, strips boilerplate, and formats the text differently depending on which app it came from, before handing it to TTS. Notifications queue by priority, with debounce logic so a burst of messages from one app doesn't turn into a wall of speech.",
    "A hardware gesture stops or snoozes speech instantly, screen off included, and a home screen widget gives quick control without opening the app at all. Debounce logic sounds simple until five apps fire notifications in the same second and you have to decide, in real time, what gets spoken, what gets merged, and what gets dropped, without the user ever feeling like they missed something.",
  ],
};

export type ExperienceBullet = string;

export interface ExperienceEntry {
  company: string;
  role: string;
  dates: string;
  location: string;
  summary?: string;
  subEntries?: { name: string; bullets: ExperienceBullet[] }[];
  bullets?: ExperienceBullet[];
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
        bullets: [
          "Designed and built a complete CRM module, automating activity, opportunity, scheme, and receipt workflows.",
          "Handled multi-tax financial calculations (CGST, SGST, IGST, VAT) and PDF invoice generation with custom layouts using the pdf package.",
          "Integrated RFID-based stock-taking for bulk scanning of tagged inventory with real-time item tracking, plus MRZ and card-data parsing for identity and payment workflows.",
        ],
      },
      {
        name: "N Divo, Jewellery Business Analytics App for Owners",
        bullets: [
          "Built and maintained dashboards covering stock, sales, salesmen performance, profits, assets, and liabilities.",
          "Developed a branch-level aggregation module so owners can view combined data across multiple jewellery branches in one place.",
          "Added biometric authentication to secure sensitive business and financial data.",
        ],
      },
    ],
  },
  {
    company: "Regional Technologies",
    role: "Flutter Developer Intern",
    dates: "01/2025 - 02/2025",
    location: "Calicut, Kerala",
    bullets: [
      "Led a team of 4 developers building a real-time emergency vehicle priority system with Flutter and Django, cutting ambulance response times by 30%.",
      "Built geofencing notifications, SOS requests, and a medical chatbot that lifted user engagement by 20%.",
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
    items: ["Play Store & App Store", "Postman", "Git", "Azure DevOps", "GitHub", "Figma", "Notion"],
  },
  {
    label: "Firebase",
    items: ["Crashlytics", "Performance Monitoring", "App Check", "Cloud Messaging"],
  },
];

export const achievement =
  "BR Hackathon, organized by PearAl. Track winner at PearAl (Y Combinator W24).";

export const education = {
  degree: "Bachelor of Computer Science",
  school: "College of Applied Science Vazhakkad",
  location: "Malappuram, Kerala",
  dates: "2022 - 2025",
};

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];
