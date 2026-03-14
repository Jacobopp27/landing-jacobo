'use client'

import { motion } from 'framer-motion'

// PATTERN: Inverted Pyramid — value prop headline first, CTA above fold, specificity over vagueness
// SHARP EDGE: value-prop-vacuum avoided — headline answers "what do you do?" in 5 seconds
// SHARP EDGE: scroll-assumption avoided — complete story above fold
// VALIDATION: hero has CTA + benefit statements above fold


export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden bg-grid"
    >
      {/* Hero glow */}
      <div
        className="absolute inset-x-0 top-0 h-[600px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(6,182,212,0.12), transparent)',
        }}
      />

      {/* Subtle purple glow bottom-right */}
      <div
        className="absolute right-0 bottom-1/3 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow — specificity pattern */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs tracking-widest uppercase text-accent">
              Available for new projects
            </span>
          </motion.div>

          {/* Headline — clear value prop, not vague "welcome" */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight text-text-primary mb-6"
          >
            I build{' '}
            <span className="gradient-text">AI systems</span>
            <br />
            that replace
            <br />
            manual work.
          </motion.h1>

          {/* Subheadline — specific, benefit-focused */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-xl"
          >
            AI agents · LLM pipelines · automation workflows · SaaS platforms.
            <br />
            <span className="text-text-primary">Jacobo Posada</span> — AI Automation Engineer
            & Full Stack Developer.
          </motion.p>

          {/* CTAs — max 2, primary high-contrast, secondary lower-weight (validation: too-many-ctas-hero) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
                         bg-accent text-background hover:bg-accent-hover shadow-glow-sm
                         transition-all duration-200 hover:shadow-glow-md"
            >
              View projects
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm
                         border border-border text-text-secondary hover:text-text-primary
                         hover:border-border-2 transition-all duration-200"
            >
              Get in touch
            </a>
          </motion.div>

        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-text-muted font-mono">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
      </motion.div>
    </section>
  )
}
