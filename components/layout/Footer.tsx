export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-mono text-sm text-text-muted">
          <span className="text-accent">~/</span>jacoboposada · {new Date().getFullYear()}
        </span>
        <div className="flex items-center gap-6">
          <a
            href="mailto:jacobopp7@gmail.com"
            className="text-sm text-text-muted hover:text-accent transition-colors duration-200"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/jacobo-posada27"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-accent transition-colors duration-200"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Jacobopp27"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-accent transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
