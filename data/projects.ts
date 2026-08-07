export type TechTag = {
  label: string
  color?: 'cyan' | 'purple' | 'green' | 'orange' | 'default'
}

export type ArchStep = {
  label: string
  description?: string
}

export type Project = {
  slug: string
  title: string
  tagline: string
  description: string
  techStack: TechTag[]
  featured: boolean
  product?: boolean
  category: string
  badge?: string
  liveUrl?: string
  githubUrl?: string
  // Case study fields
  overview?: string
  problem?: string
  solution?: string
  architecture?: ArchStep[]
  results?: string[]
}

export const projects: Project[] = [
  {
    slug: 'kotiza',
    title: 'kotiza',
    tagline: 'The Colombian anti-Excel system for quoting services.',
    description:
      'Multi-tenant SaaS where a small business builds a quote, sends it, and the client approves it online. Calculates VAT and Régimen Simple, protects the minimum margin per product, and generates the PDF — no Excel templates, no broken formulas.',
    techStack: [
      { label: 'Next.js', color: 'cyan' },
      { label: 'Prisma', color: 'default' },
      { label: 'Neon', color: 'green' },
      { label: 'Claude', color: 'purple' },
      { label: 'TypeScript', color: 'cyan' },
      { label: 'React Native', color: 'cyan' },
    ],
    featured: true,
    product: true,
    category: 'SaaS Platform',
    badge: 'Live',
    liveUrl: 'https://kotiza.co',
    overview:
      'kotiza is my own product: a quoting platform built for Colombian tax reality. It started as an internal system and today it is a multi-tenant SaaS with subscription plans in pesos, mobile apps on both stores, and an AI layer that lets you quote by speaking instead of filling forms.',
    problem:
      'Colombian small businesses and agencies quote in Excel and Word: templates that break, VAT and Régimen Simple calculated by hand, margins lost to a formula error, and a PDF emailed with no way to know if the client opened it.',
    solution:
      'A platform where quotes are built from products and templates, taxes and margin calculate themselves, the PDF is generated with the business branding, and the client approves from a link — no printing, no signing. Voice capture transcribes what you dictate and AI assembles the line items.',
    architecture: [
      { label: 'Quote builder', description: 'Templates, products, and minimum margin per product' },
      { label: 'Tax engine', description: 'VAT and Régimen Simple calculated to the exact peso' },
      { label: 'Voice → quote', description: 'Transcription + Claude assemble the dictated line items' },
      { label: 'Online approval', description: 'The client approves from a link, no account needed' },
      { label: 'Mobile apps', description: 'React Native, published on the App Store and Google Play' },
    ],
    results: [
      'Mobile apps published on the App Store and Google Play',
      'In production with subscription plans in Colombian pesos',
      'Quote by voice: you dictate and AI assembles the line items',
      'Costs and rates protected server-side, never exposed to the client',
    ],
  },
  {
    slug: 'hilo',
    title: "hilo — a factory's brain",
    tagline: 'An AI agent that runs the floor of a textile workshop: it quotes, buys, and tracks production.',
    description:
      'The finance and production platform of NAPSA Confecciones. An agent powered by Claude captures by chat and voice, reads purchase invoices with OCR, drafts production sheets and purchase orders, and tracks shop-floor progress in real time. Operators log progress with a QR from their phone, even offline.',
    techStack: [
      { label: 'Next.js', color: 'cyan' },
      { label: 'Claude', color: 'purple' },
      { label: 'Drizzle', color: 'green' },
      { label: 'PostgreSQL', color: 'default' },
      { label: 'Telegram Bot', color: 'cyan' },
      { label: 'TypeScript', color: 'cyan' },
    ],
    featured: true,
    category: 'AI Platform',
    badge: 'Production',
    overview:
      'hilo is the nervous system of a Colombian textile workshop: it connects quoting with production, purchasing, and cash. On top lives an agent that captures information without friction and proposes the next step — always as a draft, never executing on its own.',
    problem:
      "In a garment workshop the information lives in people's heads and on paper: how much fabric each garment takes, what stage each order is in, what is owed to which supplier. Nobody has time to sit and fill in a system, so the system never reflects reality.",
    solution:
      'Drop the friction of data capture to zero and let an agent do the heavy lifting. You send a photo of an invoice over Telegram with a plain-language instruction and it proposes the entry; the operator scans a QR at their station and logs progress by quantity; the agent learns how much fabric each garment consumes by asking when it does not know.',
    architecture: [
      { label: 'Conversational capture', description: 'Chat and voice → projects, quotes, and invoice entries' },
      { label: 'Invoice OCR', description: 'Claude reads the invoice and proposes the per-project split' },
      { label: 'QR shop floor', description: 'Per-station screen, offline-first, operator PIN' },
      { label: 'Derived kardex', description: 'Stock is computed from movements, never written by hand' },
      { label: 'Role-scoped agent', description: 'Every tool declares who can call it — filtered in code, not in the prompt' },
    ],
    results: [
      "Running in production against the company's real database",
      'Telegram bot live, with signed PDFs that open without login',
      'The floor reports progress by QR even when the internet drops',
      'The agent only proposes drafts and everything lands in the audit log',
    ],
  },
  {
    slug: 'herramientas',
    title: 'Live tools',
    tagline: 'Four tools you can open and use right now — nothing to install.',
    description:
      'An electric-vs-gas car comparator that traces your real routes over the map of Medellín, a dance trainer running pose detection in your own browser, a Colombian payroll calculator, and a CRM for clinics. All running on this same site.',
    techStack: [
      { label: 'Next.js', color: 'cyan' },
      { label: 'Supabase', color: 'green' },
      { label: 'Leaflet', color: 'default' },
      { label: 'TensorFlow.js', color: 'orange' },
      { label: 'React', color: 'cyan' },
    ],
    featured: true,
    category: 'Tools',
    badge: 'Try them',
    liveUrl: '/herramientas',
  },
  {
    slug: 'simulador-mundial',
    title: 'World Cup 2026 Simulator',
    tagline: 'Probabilistic model that called Spain as champion and Norway as the breakout team.',
    description:
      'ELO ratings combined with a bivariate Poisson distribution and Monte Carlo simulation over 49,000 historical matches from 244 national teams. Not a language model giving opinions: statistics running thousands of tournaments to estimate who lifts the cup.',
    techStack: [
      { label: 'Python', color: 'cyan' },
      { label: 'NumPy', color: 'default' },
      { label: 'SciPy', color: 'default' },
      { label: 'pandas', color: 'default' },
      { label: 'Monte Carlo', color: 'purple' },
    ],
    featured: true,
    category: 'Data Science',
    overview:
      "A statistical model built to predict the 2026 World Cup. It takes each team's historical strength, models each match's goals as a bivariate Poisson process, and simulates the full tournament thousands of times to derive the probability of every outcome.",
    problem:
      'Football predictions are usually opinion dressed up as analysis. I wanted an answer that came from the data: not "who I think wins", but "in how many of ten thousand simulated World Cups does each team win".',
    solution:
      "ELO ratings per national team fed with real historical data, a bivariate Poisson model that captures the correlation between both teams' goals, and a Monte Carlo simulation that runs the full tournament — group stage and knockouts — thousands of times.",
    architecture: [
      { label: 'Data ingestion', description: 'Unified scraping of historical sources: 244 national teams' },
      { label: 'ELO ratings', description: 'Relative strength of each national team from match history' },
      { label: 'Bivariate Poisson', description: "Models both teams' goals with their correlation" },
      { label: 'Monte Carlo', description: 'Simulates the full tournament thousands of times' },
    ],
    results: [
      'Called Spain as the 2026 World Cup champion',
      'Called Norway as the breakout team of the tournament',
      '49,000 historical matches from 244 national teams processed',
      'Anti-hallucination policy: missing data counts as 0, never invented',
    ],
  },
  {
    slug: 'autonomous-sdr',
    title: 'Autonomous SDR Agent',
    tagline: 'AI sales agent that discovers leads and automates outreach end-to-end.',
    description:
      'A fully autonomous sales development pipeline powered by LLMs. Scrapes and enriches lead data, personalizes outreach using GPT-4, and orchestrates multi-step email sequences — all without human intervention.',
    techStack: [
      { label: 'Python', color: 'cyan' },
      { label: 'GPT-4', color: 'purple' },
      { label: 'LangChain', color: 'purple' },
      { label: 'FastAPI', color: 'cyan' },
      { label: 'PostgreSQL', color: 'default' },
      { label: 'Playwright', color: 'green' },
    ],
    featured: true,
    category: 'AI Agent',
    githubUrl: 'https://github.com/Jacobopp27/autonomous-sdr',
    overview:
      'The Autonomous SDR Agent is an end-to-end sales prospecting system that replaces manual lead research and email writing with an AI-driven pipeline. It identifies target companies, enriches contact data, crafts hyper-personalized outreach, and tracks engagement — running 24/7 without human input.',
    problem:
      'Sales teams spend 60–70% of their time on manual prospecting, research, and repetitive email writing. This bottleneck limits pipeline capacity and makes scaling outbound impossible without hiring more SDRs.',
    solution:
      'A multi-agent LLM system where specialized agents handle discrete stages of the pipeline: a Scraper Agent discovers and validates leads, an Enrichment Agent pulls company context and intent signals, a Personalization Agent crafts tailored emails using GPT-4, and an Orchestration Agent manages sequencing, follow-ups, and CRM updates.',
    architecture: [
      { label: 'Lead Scraper', description: 'Playwright + custom parsers discover qualified companies' },
      { label: 'Enrichment Engine', description: 'APIs + LLM extract intent signals and decision-maker data' },
      { label: 'Personalization LLM', description: 'GPT-4 generates tailored multi-step email sequences' },
      { label: 'Sequence Orchestrator', description: 'n8n + FastAPI manages send schedules and follow-up logic' },
      { label: 'CRM Sync', description: 'PostgreSQL + webhooks keep all activity logged and synced' },
    ],
    results: [
      '10x increase in outreach volume vs manual process',
      'Average reply rate 3–5% above industry benchmark',
      'Pipeline fully operational within 48h of onboarding',
      'Zero SDR headcount required for initial outbound',
    ],
  },
  {
    slug: 'ai-meeting-minutes',
    title: 'AI Meeting Minutes Generator',
    tagline: 'Converts meeting transcripts into structured official reports.',
    description:
      'A document intelligence system that ingests transcripts from meetings and voice memos, and outputs structured, professional reports — action items, summaries, decisions, and follow-ups — in seconds.',
    techStack: [
      { label: 'Python', color: 'cyan' },
      { label: 'GPT-4', color: 'purple' },
      { label: 'FastAPI', color: 'cyan' },
      { label: 'React', color: 'cyan' },
      { label: 'PostgreSQL', color: 'default' },
    ],
    featured: true,
    category: 'AI Pipeline',
    githubUrl: 'https://github.com/Jacobopp27/creacion_actas',
    overview:
      'This system removes the burden of manual note-taking from meetings. It transcribes audio with OpenAI Whisper, structures the content with GPT-4 using a customizable report template, and delivers formatted documents ready for sharing or archival.',
    problem:
      'Professionals waste hours weekly transcribing recordings, organizing meeting notes, and formatting reports. The process is error-prone, inconsistent, and delays follow-up actions.',
    solution:
      'An intelligent pipeline where Whisper transcribes audio with speaker detection, GPT-4 extracts structured information using custom prompts (agenda, decisions, action items, owners), and a template engine outputs formatted PDF/Word documents matching company standards.',
    architecture: [
      { label: 'Extraction LLM', description: 'GPT-4 extracts structured fields via chain-of-thought prompting' },
      { label: 'Report Builder', description: 'Template engine renders official reports in PDF/Word format' },
      { label: 'Delivery', description: 'Email delivery + document storage with search indexing' },
    ],
    results: [
      'Report generation in <30 seconds for 1-hour meetings',
      'Accuracy rated >92% by users vs manual notes',
      'Supports 10+ output templates',
      'Integrated into Slack and email workflows',
    ],
  },
  {
    slug: 'epigenetic-ai-interpreter',
    title: 'Epigenetic Test AI Interpreter',
    tagline: 'Reads medical test PDFs and generates personalized explanations and video outputs.',
    description:
      'An AI pipeline designed for a health-tech client that parses complex epigenetic lab reports (PDFs), interprets results using a medically-prompted LLM, and generates personalized video explanations delivered to patients.',
    techStack: [
      { label: 'Python', color: 'cyan' },
      { label: 'PyMuPDF', color: 'green' },
      { label: 'Claude', color: 'purple' },
      { label: 'HeyGen', color: 'purple' },
      { label: 'FastAPI', color: 'cyan' },
      { label: 'AWS S3', color: 'orange' },
    ],
    featured: true,
    category: 'AI Pipeline',
    overview:
      'Built for a health-tech client offering epigenetic testing services. The pipeline automates the interpretation of complex lab reports, turning dense scientific data into personalized, easy-to-understand video explanations that patients receive automatically after testing.',
    problem:
      "Epigenetic test results are complex and require expert interpretation. Delivering personalized explanations at scale was impossible manually — the client's team couldn't handle growing test volume without a significant bottleneck.",
    solution:
      'A document intelligence + AI generation pipeline: PyMuPDF extracts structured data from lab PDFs, Claude provides medically-grounded interpretations using carefully engineered system prompts, and HeyGen generates a personalized avatar video explanation for each patient automatically.',
    architecture: [
      { label: 'PDF Parser', description: 'PyMuPDF extracts test markers, values, and reference ranges' },
      { label: 'Medical LLM', description: 'Claude interprets results with domain-specific system prompt' },
      { label: 'Script Builder', description: 'Personalizes explanation narrative per patient profile' },
      { label: 'Video Generator', description: 'HeyGen renders avatar video with patient-specific content' },
      { label: 'Delivery Pipeline', description: 'AWS S3 storage + automated email delivery to patient' },
    ],
    results: [
      'Processing time: <3 minutes per patient report',
      '100% of tests automatically interpreted and delivered',
      'Client eliminated manual interpretation bottleneck',
      'Patient satisfaction improved with personalized delivery',
    ],
  },
]

// ─── Products & Platforms ──────────────────────────────────────────────────

export const productProjects: Project[] = [
  {
    slug: 'laminapp',
    title: 'Laminapp',
    tagline: 'iOS app for World Cup sticker collectors to track collections and coordinate trades.',
    description:
      'Laminapp is a consumer app published on the App Store that turns sticker collecting into a social experience. Collectors track which stickers they have and which they need, and the platform automatically matches them with other collectors to coordinate trades.',
    techStack: [
      { label: 'React Native', color: 'cyan' },
      { label: 'Supabase', color: 'default' },
      { label: 'PostgreSQL', color: 'default' },
      { label: 'TypeScript', color: 'cyan' },
      { label: 'Expo', color: 'cyan' },
    ],
    featured: false,
    product: true,
    category: 'Mobile App',
    badge: 'App Store · Google Play',
    liveUrl: 'https://lamin.app/#download',   // ← update with real App Store URL
    overview:
      "Laminapp is a mobile app published on the App Store for the World Cup sticker collecting community. Collectors track their collection state and the system automatically matches them with other users for trades — eliminating the chaos of managing swaps manually through social media groups.",
    problem:
      "Sticker collectors manually track missing stickers in notes or spreadsheets, then coordinate trades through social media groups with no matching system. Finding someone who has your missing sticker and needs one of your duplicates is a manual, time-consuming process with no dedicated tooling.",
    solution:
      'A React Native mobile app where collectors register their collection state (owned, missing, duplicates) and the system runs automatic two-way matching — finding collectors where both parties can complete a beneficial trade. Supabase powers real-time updates and auth.',
    architecture: [
      { label: 'React Native App', description: 'Cross-platform mobile UI published on App Store' },
      { label: 'Collection Tracker', description: 'Per-user sticker state: owned, missing, duplicates' },
      { label: 'Match Engine', description: 'Algorithm finds mutual trade opportunities between users' },
      { label: 'Supabase', description: 'Auth, real-time DB updates, and push notifications' },
      { label: 'Trade Coordinator', description: 'Notifies matched collectors and facilitates exchange' },
    ],
    results: [
      'Published and live on the App Store',
      'Automated trade matching across entire collector base',
      'Real-time notifications when new matches are found',
      'Used actively by collectors during World Cup season',
    ],
  },
  {
    slug: 'glamping-booking-platform',
    title: 'Glamping Booking Platform',
    tagline: 'Full-stack booking platform for a glamping resort — reservations, payments, and guest management.',
    description:
      'A custom web platform built for a hospitality client to manage glamping site bookings end-to-end. Handles availability calendars, online reservations, Stripe payments, and guest communication — replacing manual coordination with a streamlined self-service system.',
    techStack: [
      { label: 'Next.js', color: 'cyan' },
      { label: 'React', color: 'cyan' },
      { label: 'PostgreSQL', color: 'default' },
      { label: 'Stripe', color: 'orange' },
      { label: 'Tailwind', color: 'cyan' },
      { label: 'Node.js', color: 'green' },
    ],
    featured: false,
    product: true,
    category: 'Web Platform',
    badge: 'Live',
    liveUrl: 'https://glampingmontesereno.com',   // ← update with real URL
    overview:
      'A complete booking system for a glamping resort built from scratch. The platform enables guests to browse available sites, check real-time availability, complete reservations with online payment, and receive automated confirmation and communication — all without manual intervention from staff.',
    problem:
      'The client was managing all bookings via WhatsApp and phone calls, manually tracking availability in spreadsheets. This led to double-bookings, missed reservations, and significant time spent on admin instead of hospitality.',
    solution:
      'A Next.js web platform with a custom booking engine, real-time availability calendar, Stripe Checkout integration, and automated email workflows — giving guests a self-service experience and giving staff a management dashboard to track all reservations.',
    architecture: [
      { label: 'Next.js Frontend', description: 'Guest-facing booking UI with availability calendar' },
      { label: 'Booking Engine', description: 'Real-time availability logic with conflict prevention' },
      { label: 'Stripe Checkout', description: 'Secure online payment and reservation confirmation' },
      { label: 'PostgreSQL', description: 'Reservation data, site inventory, and guest records' },
      { label: 'Email Automation', description: 'Confirmations, reminders, and follow-ups to guests' },
    ],
    results: [
      'Eliminated double-bookings and manual tracking completely',
      'Guests book and pay online without staff involvement',
      'Reservation confirmation delivered automatically by email',
      'Platform live and actively taking bookings',
    ],
  },
]

export const featuredProjects = projects.filter((p) => p.featured)
export const otherProjects = projects.filter((p) => !p.featured)

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
