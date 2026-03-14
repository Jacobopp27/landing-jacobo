'use client'

import { motion } from 'framer-motion'
import SectionTitle from '@/components/ui/SectionTitle'

const jobs = [
  {
    company: 'HouseEdge',
    role: 'Senior Backend Developer',
    period: '2025 – 2026',
    current: false,
    bullets: [
      'Owned backend systems for a multi-tenant B2B platform serving 100K+ users.',
      'Designed and shipped REST APIs using FastAPI and PostgreSQL for analytics, RSVP workflows, and user segmentation.',
      'Integrated LLM-powered features into the platform including automated content generation and intelligent data summarization.',
      'Built event-driven automation pipelines that replaced manual operational workflows across the product.',
      'Modeled scalable data architectures preserving historical consistency across evolving schemas.',
      'Optimized API and query performance — improved response times and system reliability under load.',
    ],
    stack: ['FastAPI', 'PostgreSQL', 'AWS', 'Python', 'OpenAI', 'Docker'],
  },
  {
    company: 'NAPSA',
    role: 'Full-Stack Developer',
    period: '2023 – 2025',
    current: false,
    bullets: [
      'Built financial reporting systems using Django and PostgreSQL for internal business stakeholders.',
      'Designed automation bots and backend workflows that eliminated manual accounting processes — 30% efficiency gain.',
      'Developed an internal AI assistant that answered questions over financial documents using RAG and LLM APIs.',
      'Implemented relational data models for reconciliation and revenue tracking.',
      'Delivered internal SaaS-like tooling used daily by operations and finance teams.',
    ],
    stack: ['Django', 'PostgreSQL', 'Python', 'React', 'OpenAI'],
  },
  {
    company: 'MultyDrink',
    role: 'Junior Full-Stack Developer',
    period: '2022 – 2023',
    current: false,
    bullets: [
      'Contributed to a marketing platform handling commissions and performance dashboards.',
      'Built notification bots and automated messaging flows to improve rep engagement.',
      'Focused on debugging and optimizing production issues in React/Node.js applications.',
      'Implemented relational DB logic and optimized frontend components for performance.',
    ],
    stack: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    company: 'Freelance',
    role: 'Full-Stack Developer — Automation & AI',
    period: '2020 – present',
    current: false,
    bullets: [
      'Designed and launched multiple SaaS tools end-to-end: architecture, backend, and deployment.',
      'Built LLM agents and AI pipelines: autonomous SDR bots, document interpreters, meeting minute generators.',
      'Developed WhatsApp and Telegram bots for appointment booking, lead qualification, and customer support.',
      'Created automation workflows connecting CRMs, APIs, and databases using n8n and custom Python scripts.',
      'Worked directly with founders translating product ideas into shipped features.',
    ],
    stack: ['Python', 'Node.js', 'React', 'FastAPI', 'OpenAI', 'Claude', 'n8n', 'Twilio'],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-24 md:py-32 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div
        className="absolute inset-x-0 bottom-0 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(139,92,246,0.06), transparent)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle
          eyebrow="Experience"
          title="5+ years shipping production systems."
          subtitle="From junior developer to senior backend engineer — startups, enterprise, and freelance."
        />

        <div className="mt-12 flex flex-col gap-0">
          {jobs.map((job, i) => (
            <motion.div
              key={job.company}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative grid md:grid-cols-[200px_1fr] gap-4 md:gap-8 pb-10 last:pb-0"
            >
              {/* Timeline line */}
              {i < jobs.length - 1 && (
                <div className="hidden md:block absolute left-[195px] top-6 bottom-0 w-px bg-border" />
              )}

              {/* Left col — company + period */}
              <div className="flex md:flex-col gap-3 md:gap-1.5 md:pt-0.5">
                <div className="flex items-center gap-2 shrink-0">
                  {/* Timeline dot */}
                  <div className="hidden md:flex relative z-10 w-3 h-3 rounded-full border-2 border-accent bg-background shrink-0 -mr-1.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">{job.company}</span>
                    {job.current && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-text-muted self-start md:self-auto">
                  {job.period}
                </span>
              </div>

              {/* Right col — role + bullets + stack */}
              <div className="flex flex-col gap-3 pb-10 md:border-b border-border last:border-0">
                <span className="text-base font-medium text-text-secondary">{job.role}</span>

                <ul className="flex flex-col gap-1.5">
                  {job.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-text-muted mt-1 shrink-0">–</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.stack.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[11px] font-mono border border-border bg-surface-2 text-text-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confidentiality note — small, honest */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-xs text-text-muted font-mono flex items-center gap-2"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Specific project details not disclosed per confidentiality agreements.
        </motion.p>
      </div>
    </section>
  )
}
