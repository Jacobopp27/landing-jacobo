'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TechBadge from '@/components/ui/TechBadge'
import SectionTitle from '@/components/ui/SectionTitle'
import { productProjects } from '@/data/projects'

const categoryIcon: Record<string, string> = {
  'SaaS Platform': '🏭',
  'Consumer Platform': '🌍',
}

// Thin visual bar showing product type at a glance
function ProductTypePill({ category }: { category: string }) {
  const isSaaS = category === 'SaaS Platform'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
        isSaaS
          ? 'bg-purple-dim text-purple border-purple/20'
          : 'bg-emerald-950/40 text-emerald-400 border-emerald-400/20'
      }`}
    >
      <span>{categoryIcon[category] ?? '◆'}</span>
      {category}
    </span>
  )
}

export default function ProductsAndPlatforms() {
  return (
    <section id="products" className="py-24 md:py-32 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Subtle purple ambient glow — differentiates this section visually */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,92,246,0.06), transparent)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative">
        <SectionTitle
          eyebrow="Products & Platforms"
          title="Software I've designed and shipped."
          subtitle="Built as products — with users, workflows, and real business logic."
        />

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {productProjects.map((project, i) => (
            <motion.article
              key={project.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden
                         hover:border-purple/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.15),0_0_30px_rgba(139,92,246,0.05)]
                         transition-all duration-300"
            >
              {/* Top accent bar — purple to differentiate from AI project cards */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-purple/40 to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex flex-col flex-1 gap-5 p-6 md:p-8">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <ProductTypePill category={project.category} />
                    <h3 className="text-2xl font-semibold text-text-primary group-hover:text-purple transition-colors duration-200">
                      {project.title}
                    </h3>
                  </div>
                  {/* Arrow */}
                  <div className="shrink-0 mt-1 text-text-muted group-hover:text-purple group-hover:translate-x-1
                                  transition-all duration-200">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed text-sm">
                  {project.description}
                </p>

                {/* Results preview — specificity pattern */}
                {project.results && (
                  <ul className="flex flex-col gap-2">
                    {project.results.slice(0, 3).map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-purple mt-0.5 shrink-0">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {project.techStack.map((tech) => (
                    <TechBadge key={tech.label} label={tech.label} color={tech.color} />
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-border">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                               border border-purple/30 text-purple hover:bg-purple hover:text-background
                               transition-all duration-200"
                  >
                    View case study
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
