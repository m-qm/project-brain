import Link from "next/link";

export function SiteNav({ ctaHref = "/wizard", ctaLabel = "Try wizard" }: { ctaHref?: string; ctaLabel?: string }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <img src="/icon.svg" alt="" width={28} height={28} className="brand-mark" />
          AGENT KBASE
        </Link>
        <nav className="nav-links" aria-label="Main">
          <Link href="/learn">Learn</Link>
          <Link href="/company-brain">Company Pack</Link>
          <Link href="/skilltree">SkillTree</Link>
          <Link href="/tree">Brain map</Link>
          <Link href="/wizard">Wizard</Link>
          <a
            href="https://github.com/m-qm/project-brain"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
        <div className="nav-actions">
          <Link className="btn" href={ctaHref}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
