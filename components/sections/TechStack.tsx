'use client'

import { motion } from 'framer-motion'
import SectionTitle from '@/components/ui/SectionTitle'

const groups = [
  {
    name: 'AI & LLM',
    color: 'purple',
    items: [
      { name: 'OpenAI / GPT-4', note: 'agents, completions, embeddings' },
      { name: 'Anthropic Claude', note: 'document intelligence, reasoning' },
      { name: 'LangChain', note: 'agent orchestration, chains' },
      { name: 'RAG systems', note: 'retrieval-augmented generation' },
      { name: 'Vector databases', note: 'Pinecone, pgvector, Chroma' },
      { name: 'Whisper', note: 'speech-to-text transcription' },
    ],
  },
  {
    name: 'Automation',
    color: 'accent',
    items: [
      { name: 'Python', note: 'core automation language' },
      { name: 'n8n', note: 'workflow automation platform' },
      { name: 'Playwright', note: 'web scraping & browser automation' },
      { name: 'REST APIs & Webhooks', note: 'system integrations' },
      { name: 'Twilio', note: 'WhatsApp & SMS automation' },
      { name: 'Zapier', note: 'no-code workflow connections' },
    ],
  },
  {
    name: 'Development',
    color: 'green',
    items: [
      { name: 'Next.js / React', note: 'full-stack web applications' },
      { name: 'FastAPI', note: 'Python APIs & microservices' },
      { name: 'PostgreSQL', note: 'relational data layer' },
      { name: 'Supabase', note: 'auth, storage, real-time' },
      { name: 'AWS / Cloud', note: 'infrastructure & deployment' },
      { name: 'Docker', note: 'containerization & CI/CD' },
    ],
  },
]

const colorMap: Record<string, { dot: string; label: string; border: string }> = {
  purple: {
    dot: 'bg-purple',
    label: 'text-purple',
    border: 'border-purple/20',
  },
  accent: {
    dot: 'bg-accent',
    label: 'text-accent',
    border: 'border-accent/20',
  },
  green: {
    dot: 'bg-emerald-400',
    label: 'text-emerald-400',
    border: 'border-emerald-400/20',
  },
}

export default function TechStack() {
  return (
    <section id="stack" className="py-24 md:py-32 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle
          eyebrow="Tech stack"
          title="Tools I ship with."
          subtitle="Everything from LLM orchestration to cloud infrastructure."
        />

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {groups.map(({ name, color, items }, gi) => {
            const c = colorMap[color]
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: gi * 0.1 }}
                className={`p-6 bg-surface border ${c.border} rounded-xl flex flex-col gap-5`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className={`font-mono text-xs tracking-widest uppercase ${c.label}`}>
                    {name}
                  </span>
                </div>

                <ul className="flex flex-col gap-3">
                  {items.map(({ name: item, note }) => (
                    <li key={item} className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-text-primary">{item}</span>
                      <span className="text-xs text-text-muted">{note}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
