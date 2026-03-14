'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import TechBadge from './TechBadge'
import type { Project } from '@/data/projects'

const categoryIcon: Record<string, string> = {
  'AI Agent': '🤖',
  'AI Platform': '⚡',
  'AI Pipeline': '🧠',
  Automation: '⚙️',
  'Web Platform': '🌐',
}

type Props = {
  project: Project
  index?: number
}

export default function ProjectCard({ project, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden
                 shadow-card hover:shadow-card-hover hover:border-accent/30 transition-all duration-300"
    >
      {/* Top accent bar — animates on hover */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-text-muted tracking-wide">
              {categoryIcon[project.category] ?? '◆'} {project.category}
            </span>
            <h3 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors duration-200">
              {project.title}
            </h3>
          </div>
          {/* Arrow icon */}
          <div className="shrink-0 mt-1 text-text-muted group-hover:text-accent group-hover:translate-x-1
                          transition-all duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-text-secondary text-sm leading-relaxed flex-1">
          {project.tagline}
        </p>

        {/* Tech stack */}
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

        {/* CTA */}
        {project.overview && (
          <div className="pt-2 border-t border-border">
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover
                         font-medium transition-colors duration-200"
            >
              View case study
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
