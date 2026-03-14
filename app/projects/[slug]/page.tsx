import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getProjectBySlug, projects, productProjects } from '@/data/projects'
import TechBadge from '@/components/ui/TechBadge'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const allProjects = [...projects, ...productProjects]

type Props = { params: { slug: string } }

export async function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = allProjects.find((p) => p.slug === params.slug)
  if (!project) return {}
  return {
    title: `${project.title} — Jacobo Posada`,
    description: project.tagline,
  }
}

// Architecture flow visual — shows system pipeline
function ArchFlow({ steps }: { steps: { label: string; description?: string }[] }) {
  return (
    <div className="relative">
      {/* Horizontal connector line */}
      <div className="absolute top-8 left-0 right-0 h-px bg-border hidden md:block" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
        {steps.map((step, i) => (
          <div key={step.label} className="relative flex flex-col items-center text-center gap-3">
            {/* Node */}
            <div className="relative z-10 w-16 h-16 flex items-center justify-center
                            bg-surface border-2 border-accent/30 rounded-xl
                            shadow-glow-sm">
              <span className="font-mono text-xs font-semibold text-accent">{i + 1}</span>
            </div>

            {/* Arrow between nodes (mobile) */}
            {i < steps.length - 1 && (
              <div className="absolute right-0 top-8 -mr-2 text-text-muted md:hidden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-text-primary">{step.label}</span>
              {step.description && (
                <span className="text-xs text-text-muted leading-snug">{step.description}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text-primary flex items-center gap-3">
        <span className="w-8 h-px bg-accent" />
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function ProjectPage({ params }: Props) {
  const project = allProjects.find((p) => p.slug === params.slug)
  if (!project || !project.overview) notFound()

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back */}
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent
                       transition-colors duration-200 mb-10 font-mono"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to projects
          </Link>

          {/* Header */}
          <div className="flex flex-col gap-4 mb-12 pb-12 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs tracking-widest uppercase text-accent">
                {project.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-text-primary leading-tight">
              {project.title}
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
              {project.tagline}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.techStack.map((tech) => (
                <TechBadge key={tech.label} label={tech.label} color={tech.color} size="md" />
              ))}
            </div>

            {/* External links */}
            {(project.liveUrl || project.githubUrl) && (
              <div className="flex items-center gap-3 pt-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                               border border-border text-text-secondary hover:text-accent hover:border-accent/30
                               transition-all duration-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Live site
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                               border border-border text-text-secondary hover:text-accent hover:border-accent/30
                               transition-all duration-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Case study body */}
          <div className="flex flex-col gap-14">
            {/* Overview */}
            <SectionBlock title="Overview">
              <p className="text-text-secondary leading-relaxed">{project.overview}</p>
            </SectionBlock>

            {/* Problem */}
            {project.problem && (
              <SectionBlock title="Problem">
                <div className="p-5 bg-surface border border-border rounded-xl border-l-2 border-l-orange-400">
                  <p className="text-text-secondary leading-relaxed">{project.problem}</p>
                </div>
              </SectionBlock>
            )}

            {/* Solution */}
            {project.solution && (
              <SectionBlock title="Solution">
                <div className="p-5 bg-surface border border-border rounded-xl border-l-2 border-l-accent">
                  <p className="text-text-secondary leading-relaxed">{project.solution}</p>
                </div>
              </SectionBlock>
            )}

            {/* Architecture */}
            {project.architecture && (
              <SectionBlock title="Technical Architecture">
                <div className="p-6 bg-surface border border-border rounded-xl overflow-x-auto">
                  <ArchFlow steps={project.architecture} />
                </div>
              </SectionBlock>
            )}

            {/* Tech stack detail */}
            <SectionBlock title="Tech Stack">
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <TechBadge key={tech.label} label={tech.label} color={tech.color} size="md" />
                ))}
              </div>
            </SectionBlock>

            {/* Results — specificity pattern: concrete outcomes */}
            {project.results && (
              <SectionBlock title="Results">
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.results.map((result) => (
                    <div
                      key={result}
                      className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl"
                    >
                      <span className="text-accent mt-0.5 shrink-0 text-lg">✓</span>
                      <p className="text-sm text-text-secondary leading-relaxed">{result}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            )}
          </div>

          {/* CTA at bottom of case study */}
          <div className="mt-16 pt-12 border-t border-border flex flex-col sm:flex-row items-start sm:items-center
                          justify-between gap-6">
            <div>
              <p className="text-text-primary font-medium">Need something similar?</p>
              <p className="text-sm text-text-secondary">I build production AI systems for clients worldwide.</p>
            </div>
            <a
              href="mailto:jacobopp7@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
                         bg-accent text-background hover:bg-accent-hover shadow-glow-sm
                         transition-all duration-200 whitespace-nowrap"
            >
              Discuss your project
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
