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
  {
    slug: 'whatsapp-appointment-automation',
    title: 'WhatsApp Appointment Automation',
    tagline: 'Automated appointment booking and reminders via WhatsApp.',
    description:
      'A conversational bot that handles appointment scheduling, confirmations, and reminders via WhatsApp — integrating with calendar systems and reducing no-shows.',
    techStack: [
      { label: 'Python', color: 'cyan' },
      { label: 'Twilio', color: 'green' },
      { label: 'OpenAI', color: 'purple' },
      { label: 'Google Calendar', color: 'default' },
      { label: 'FastAPI', color: 'cyan' },
    ],
    featured: false,
    category: 'Automation',
  },
  {
    slug: 'ai-lead-generation',
    title: 'AI Lead Generation Tools',
    tagline: 'Automated lead discovery and qualification pipelines.',
    description:
      'A suite of AI-powered tools that scrape, enrich, score, and qualify leads from multiple sources — delivering sales-ready prospects to CRMs automatically.',
    techStack: [
      { label: 'Python', color: 'cyan' },
      { label: 'GPT-4', color: 'purple' },
      { label: 'Playwright', color: 'green' },
      { label: 'Apollo', color: 'default' },
      { label: 'n8n', color: 'orange' },
    ],
    featured: false,
    category: 'Automation',
  },
  {
    slug: 'automation-pipelines',
    title: 'Automation Pipelines',
    tagline: 'Business process automation across multiple industries.',
    description:
      'A collection of custom automation workflows built for clients across e-commerce, legal, real-estate, and logistics — connecting APIs, processing data, and eliminating manual work.',
    techStack: [
      { label: 'n8n', color: 'orange' },
      { label: 'Python', color: 'cyan' },
      { label: 'Zapier', color: 'default' },
      { label: 'Webhooks', color: 'green' },
      { label: 'REST APIs', color: 'default' },
    ],
    featured: false,
    category: 'Automation',
  },
]

// ─── Products & Platforms ──────────────────────────────────────────────────

export const productProjects: Project[] = [
  {
    slug: 'flowbiit',
    title: 'Flowbiit',
    tagline: 'SaaS platform for textile and manufacturing businesses to manage production workflows.',
    description:
      'Flowbiit digitizes the production management layer for small and medium manufacturing companies. Teams track orders through every production stage, manage resources, and get operational visibility — replacing spreadsheets and manual coordination with a structured platform.',
    techStack: [
      { label: 'React', color: 'cyan' },
      { label: 'FastAPI', color: 'cyan' },
      { label: 'PostgreSQL', color: 'default' },
      { label: 'Python', color: 'cyan' },
      { label: 'Docker', color: 'default' },
      { label: 'VPS', color: 'orange' },
    ],
    featured: false,
    product: true,
    category: 'SaaS Platform',
    badge: 'Live',
    liveUrl: 'https://flowbiit.com',   // ← update with real URL
    githubUrl: 'https://github.com/Jacobopp27/flowbit',
    overview:
      'Flowbiit is a production management SaaS built for the textile and manufacturing sector. The platform gives operations teams a structured, digital environment to manage orders, track workflow stages, monitor resource allocation, and make data-driven decisions — all within a single interface designed for manufacturing realities.',
    problem:
      'Small and medium manufacturing companies operate with fragmented tools: spreadsheets, WhatsApp threads, and verbal handoffs. This creates production blind spots, delays in order tracking, and zero visibility into bottlenecks — costing time and money at every step of the process.',
    solution:
      'A full-stack SaaS platform with a React frontend and FastAPI backend, purpose-built for manufacturing workflows. The platform models production as configurable stage pipelines, allows teams to move orders across stages, assigns resources and responsibilities, and surfaces operational metrics through dashboards.',
    architecture: [
      { label: 'React Dashboard', description: 'Operational UI for teams to manage orders and workflows' },
      { label: 'FastAPI Backend', description: 'REST API handling business logic, auth, and data access' },
      { label: 'Workflow Engine', description: 'Configurable stage pipelines per product type' },
      { label: 'PostgreSQL', description: 'Relational data model for orders, resources, and stages' },
      { label: 'Docker / VPS', description: 'Containerized deployment on cloud infrastructure' },
    ],
    results: [
      'Full production workflow digitized end-to-end',
      'Order-to-delivery visibility across all stages',
      'Replaced spreadsheet-based operations for clients',
      'Deployed on production infrastructure with multi-tenant support',
    ],
  },
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
    badge: 'App Store',
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
