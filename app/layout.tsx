import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jacobo Posada — AI Automation Engineer & Full Stack Developer',
  description:
    'I design and build AI systems, automation pipelines, and digital platforms. Specializing in LLM agents, RAG systems, and production SaaS.',
  keywords: [
    'AI Engineer',
    'Automation',
    'Full Stack Developer',
    'LLM',
    'AI Agents',
    'FastAPI',
    'Next.js',
    'Python',
  ],
  authors: [{ name: 'Jacobo Posada' }],
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Jacobo Posada — AI Automation Engineer',
    description: 'Building AI systems, automation pipelines, and digital platforms.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-text-primary antialiased">{children}</body>
    </html>
  )
}
