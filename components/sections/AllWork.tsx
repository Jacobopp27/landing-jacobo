'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import TechBadge from '@/components/ui/TechBadge'
import SectionTitle from '@/components/ui/SectionTitle'
import { projects, productProjects } from '@/data/projects'
import type { Project } from '@/data/projects'

// Merge and annotate all work in one place
const allWork: Project[] = [
  ...projects.filter((p) => p.featured),     // AI featured — large cards
  ...productProjects,                          // Products & platforms — large cards
  ...projects.filter((p) => !p.featured),    // Other — compact cards
]

const FILTERS = ['All', 'AI Systems', 'Products', 'Automation', 'Web'] as const
type Filter = typeof FILTERS[number]

function matchesFilter(p: Project, f: Filter): boolean {
  if (f === 'All') return true
  if (f === 'AI Systems') return ['AI Agent', 'AI Platform', 'AI Pipeline'].includes(p.category)
  if (f === 'Products') return !!p.product
  if (f === 'Automation') return p.category === 'Automation'
  if (f === 'Web') return ['Web Platform', 'Consumer Platform'].includes(p.category)
  return true
}

const categoryAccent: Record<string, string> = {
  'AI Agent': 'text-accent border-accent/20 bg-accent-dim',
  'AI Platform': 'text-accent border-accent/20 bg-accent-dim',
  'AI Pipeline': 'text-accent border-accent/20 bg-accent-dim',
  'SaaS Platform': 'text-purple border-purple/20 bg-purple-dim',
  'Consumer Platform': 'text-emerald-400 border-emerald-400/20 bg-emerald-950/40',
  'Web Platform': 'text-purple border-purple/20 bg-purple-dim',
  Automation: 'text-orange-400 border-orange-400/20 bg-orange-950/40',
}

const badgeStyle: Record<string, string> = {
  'App Store': 'bg-blue-950/60 text-blue-400 border-blue-400/30',
  Live: 'bg-emerald-950/60 text-emerald-400 border-emerald-400/30',
  Production: 'bg-accent-dim text-accent border-accent/30',
}

// Large card — featured AI projects and products
function LargeCard({ project, index }: { project: Project; index: number }) {
  const accent = project.product ? 'group-hover:border-purple/30' : 'group-hover:border-accent/30'
  const titleHover = project.product ? 'group-hover:text-purple' : 'group-hover:text-accent'
  const checkColor = project.product ? 'text-purple' : 'text-accent'
  const ctaBorder = project.product
    ? 'border-purple/30 text-purple hover:bg-purple hover:text-background'
    : 'border-accent/30 text-accent hover:bg-accent hover:text-background'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className={`group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden
                  ${accent} hover:shadow-card-hover transition-all duration-300`}
    >
      {/* Stretched card link — covers entire card */}
      {project.overview && (
        <Link
          href={`/projects/${project.slug}`}
          className="absolute inset-0 z-0"
          aria-label={`View ${project.title} case study`}
        />
      )}

      {/* Accent top bar */}
      <div className={`h-px w-full bg-gradient-to-r from-transparent ${project.product ? 'via-purple/40' : 'via-accent/40'} to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="flex flex-col flex-1 gap-5 p-6 md:p-8">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono border ${categoryAccent[project.category] ?? 'text-text-muted border-border bg-surface-2'}`}>
            {project.category}
          </span>
          {project.badge && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono border ${badgeStyle[project.badge] ?? ''}`}>
              {project.badge === 'App Store' && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              {project.badge}
            </span>
          )}
        </div>

        {/* Title + description */}
        <div className="flex flex-col gap-2">
          <h3 className={`text-xl md:text-2xl font-semibold text-text-primary ${titleHover} transition-colors duration-200`}>
            {project.title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">{project.description}</p>
        </div>

        {/* Results — specific outcomes */}
        {project.results && (
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {project.results.slice(0, 4).map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className={`${checkColor} mt-0.5 shrink-0`}>✓</span>
                {r}
              </li>
            ))}
          </ul>
        )}

        {/* Architecture flow */}
        {project.architecture && (
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-text-muted">
            {project.architecture.map((step, i) => (
              <span key={step.label} className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-surface-2 border border-border text-text-secondary">
                  {step.label}
                </span>
                {i < project.architecture!.length - 1 && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 5).map((tech) => (
              <TechBadge key={tech.label} label={tech.label} color={tech.color} />
            ))}
            {project.techStack.length > 5 && (
              <span className="text-[11px] text-text-muted font-mono self-center">
                +{project.techStack.length - 5}
              </span>
            )}
          </div>
          <div className="relative z-10 flex items-center gap-2">
            {/* Live link */}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Live site"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border
                           text-text-muted hover:text-accent hover:border-accent/30 transition-all duration-200"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
            {/* GitHub link */}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border
                           text-text-muted hover:text-accent hover:border-accent/30 transition-all duration-200"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            )}
            {/* Deep dive — pointer hint when card is fully clickable */}
            {project.overview && (
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border ${ctaBorder} pointer-events-none`}
              >
                Deep dive
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// Compact card — other/smaller projects
function CompactCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group relative flex flex-col gap-3 p-5 bg-surface border border-border rounded-xl
                 hover:border-accent/20 hover:shadow-card-hover transition-all duration-300"
    >
      {/* Stretched card link */}
      {project.overview && (
        <Link
          href={`/projects/${project.slug}`}
          className="absolute inset-0 z-0"
          aria-label={`View ${project.title} case study`}
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className={`inline-flex self-start items-center px-2 py-0.5 rounded text-[10px] font-mono border ${categoryAccent[project.category] ?? 'text-text-muted border-border bg-surface-2'}`}>
            {project.category}
          </span>
          <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors duration-200">
            {project.title}
          </h3>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">{project.tagline}</p>

      <div className="flex flex-wrap gap-1">
        {project.techStack.slice(0, 4).map((tech) => (
          <TechBadge key={tech.label} label={tech.label} color={tech.color} size="sm" />
        ))}
      </div>

      {(project.liveUrl || project.githubUrl) && (
        <div className="relative z-10 flex items-center gap-2 mt-auto pt-3 border-t border-border">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-text-muted hover:text-accent transition-colors duration-200"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-text-muted hover:text-accent transition-colors duration-200"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </a>
          )}
        </div>
      )}
    </motion.article>
  )
}

export default function AllWork() {
  const [active, setActive] = useState<Filter>('All')

  const filtered = allWork.filter((p) => matchesFilter(p, active))
  const large = filtered.filter((p) => p.featured || p.product)
  const compact = filtered.filter((p) => !p.featured && !p.product)

  return (
    <section id="projects" className="py-24 md:py-32 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <SectionTitle
            eyebrow="Work"
            title="Everything I've shipped."
            subtitle="AI systems, automation pipelines, SaaS products and platforms."
          />

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 ${
                  active === f
                    ? 'bg-accent text-background border-accent'
                    : 'text-text-secondary border-border hover:border-border-2 hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active} className="flex flex-col gap-10">
            {/* Large cards — featured AI + products */}
            {large.length > 0 && (
              <div className="grid md:grid-cols-2 gap-5">
                {large.map((p, i) => (
                  <LargeCard key={p.slug} project={p} index={i} />
                ))}
              </div>
            )}

            {/* Compact cards — other projects */}
            {compact.length > 0 && (
              <>
                {large.length > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
                      More projects
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {compact.map((p, i) => (
                    <CompactCard key={p.slug} project={p} index={i} />
                  ))}
                </div>
              </>
            )}

            {filtered.length === 0 && (
              <p className="text-text-muted text-sm font-mono py-8">
                No projects in this category yet.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
