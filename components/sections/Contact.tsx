'use client'

import { motion } from 'framer-motion'

// PATTERN: Final CTA section — strong, specific, addresses objections (sharp edge: weak-final-cta)
// PATTERN: Progressive disclosure — contact starts with email (minimal friction)
// VALIDATION: weak-final-cta avoided — compelling final section before footer

const links = [
  {
    label: 'Email',
    value: 'jacobopp7@gmail.com',
    href: 'mailto:jacobopp7@gmail.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/jacobo-posada27',
    href: 'https://www.linkedin.com/in/jacobo-posada27',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    value: 'github.com/Jacobopp27',
    href: 'https://github.com/Jacobopp27',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Glow */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(6,182,212,0.07), transparent)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="font-mono text-xs tracking-widest uppercase text-accent">
              Contact
            </span>

            {/* Strong final headline — specificity pattern */}
            <h2 className="text-4xl md:text-5xl font-semibold text-text-primary leading-tight text-balance">
              Have an AI system to build?
            </h2>

            {/* Objection handling — removes friction */}
            <p className="text-lg text-text-secondary leading-relaxed">
              Whether it&apos;s an autonomous agent, an automation pipeline, or a full-stack
              platform — I&apos;ll tell you if I can help, and how, within 24 hours.
            </p>

            {/* Primary CTA — high contrast, action-oriented text */}
            <a
              href="mailto:jacobopp7@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-base
                         bg-accent text-background hover:bg-accent-hover shadow-glow-md
                         transition-all duration-200 hover:scale-105"
            >
              Send me a message
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>

            <span className="text-xs text-text-muted font-mono">
              No forms. No friction. Just email.
            </span>
          </motion.div>

          {/* Contact links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-14 grid grid-cols-3 gap-4"
          >
            {links.map(({ label, value, href, icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="group flex flex-col items-center gap-3 p-5 bg-surface border border-border
                           rounded-xl hover:border-accent/30 hover:shadow-card-hover transition-all duration-300"
              >
                <span className="text-text-muted group-hover:text-accent transition-colors duration-200">
                  {icon}
                </span>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
                    {label}
                  </span>
                  <span className="text-xs text-text-secondary text-center leading-snug hidden sm:block">
                    {value}
                  </span>
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
