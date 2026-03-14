'use client'

import { motion } from 'framer-motion'
import SectionTitle from '@/components/ui/SectionTitle'

// PATTERN: feature-lists-instead-of-benefits avoided — each card explains OUTCOME, not just what it is

const pillars = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    ),
    category: 'AI Systems',
    headline: 'Agents that work while you sleep.',
    description:
      'LLM agents, RAG pipelines, and AI orchestration systems that automate complex decision-making. From autonomous SDR bots to document intelligence — production-grade, not toy demos.',
    outcomes: ['Autonomous lead discovery & outreach', 'Document parsing & interpretation', 'Multi-step AI pipelines'],
    accent: 'accent',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    category: 'Automation',
    headline: 'Eliminate the repetitive. Ship the rest.',
    description:
      'Custom bots, API integrations, and workflow automation that remove manual bottlenecks at scale. If a human is doing it repeatedly, it can be automated — and should be.',
    outcomes: ['API & webhook integrations', 'Multi-step workflow automation', 'Data scraping & enrichment'],
    accent: 'purple',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    category: 'Platforms',
    headline: 'SaaS products ready to ship.',
    description:
      'Full-stack web applications with auth, billing, and infrastructure. Built with Next.js, FastAPI, and PostgreSQL — production-ready from day one, not day ninety.',
    outcomes: ['SaaS tools with Stripe billing', 'Internal operations dashboards', 'Customer-facing web apps'],
    accent: 'accent',
  },
]

const accentMap: Record<string, string> = {
  accent: 'text-accent border-accent/20 bg-accent-dim',
  purple: 'text-purple border-purple/20 bg-purple-dim',
}

export default function WhatIBuild() {
  return (
    <section id="what-i-build" className="py-24 md:py-32 relative">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle
          eyebrow="What I build"
          title="AI systems that solve real problems."
          subtitle="Not prototypes — production systems with measurable outcomes."
        />

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {pillars.map(({ icon, category, headline, description, outcomes, accent }, i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group flex flex-col gap-5 p-6 bg-surface border border-border rounded-xl
                         hover:border-accent/20 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg border ${accentMap[accent]}`}>
                {icon}
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs tracking-widest uppercase text-text-muted">
                  {category}
                </span>
                <h3 className="text-lg font-semibold text-text-primary leading-snug">
                  {headline}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
              </div>

              {/* Outcomes — specificity pattern */}
              <ul className="flex flex-col gap-2 mt-auto">
                {outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${accent === 'purple' ? 'bg-purple' : 'bg-accent'}`} />
                    {o}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
