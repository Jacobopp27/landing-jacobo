'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TechBadge from '@/components/ui/TechBadge'
import SectionTitle from '@/components/ui/SectionTitle'
import { featuredProjects } from '@/data/projects'

// PATTERN: Specificity — each card leads with outcome, not just description
// VALIDATION: feature section has visual hierarchy (category icons, tags, outcomes)

const categoryIcon: Record<string, string> = {
  'AI Agent': '🤖',
  'AI Platform': '⚡',
  'AI Pipeline': '🧠',
}

// Architecture flow visual component
function ArchFlow({ steps }: { steps: { label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-text-muted">
      {steps.map((step, i) => (
        <span key={step.label} className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-surface-2 border border-border text-text-secondary">
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </span>
      ))}
    </div>
  )
}

export default function FeaturedProjects() {
  return (
    <section id="projects" className="py-24 md:py-32 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle
          eyebrow="Featured projects"
          title="What I've shipped."
          subtitle="Production systems with real outcomes — not side projects."
        />

        <div className="mt-12 flex flex-col gap-6">
          {featuredProjects.map((project, i) => (
            <motion.article
              key={project.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group relative grid md:grid-cols-[1fr_auto] gap-6 p-6 md:p-8
                         bg-surface border border-border rounded-xl
                         hover:border-accent/30 hover:shadow-card-hover transition-all duration-300"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-xl" />

              <div className="flex flex-col gap-4">
                {/* Category + title */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs text-text-muted tracking-wide">
                    {categoryIcon[project.category]} {project.category}
                  </span>
                  <h3 className="text-2xl font-semibold text-text-primary group-hover:text-accent transition-colors duration-200">
                    {project.title}
                  </h3>
                </div>

                {/* Tagline — benefit-led */}
                <p className="text-text-secondary leading-relaxed max-w-xl">
                  {project.description}
                </p>

                {/* Architecture flow */}
                {project.architecture && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
                      Architecture
                    </span>
                    <ArchFlow steps={project.architecture} />
                  </div>
                )}

                {/* Results — specificity pattern: concrete numbers */}
                {project.results && (
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {project.results.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-accent mt-0.5 shrink-0">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <TechBadge key={tech.label} label={tech.label} color={tech.color} size="md" />
                  ))}
                </div>
              </div>

              {/* Case study CTA */}
              <div className="flex md:flex-col items-start md:items-end justify-between md:justify-start gap-4 md:pt-1">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                             border border-accent/30 text-accent hover:bg-accent hover:text-background
                             transition-all duration-200 whitespace-nowrap"
                >
                  Case study
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
