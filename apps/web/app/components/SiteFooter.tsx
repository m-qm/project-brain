import Link from "next/link";
import { FOOTER_LEGAL_LINKS, FOOTER_OPERATOR } from "@/lib/site-footer";

const PRODUCT_LINKS = (
  <>
    <Link href="https://agentkbase.com">agentkbase.com</Link>
    {" · "}
    Agent KBase · open source · pairs with{" "}
    <a href="https://skilltree.ai" target="_blank" rel="noopener noreferrer">
      SkillTree
    </a>
    {" · "}
    <Link href="https://www.npmjs.com/package/@agentkbase/cli">npm</Link>
    {" · "}
    <Link href="https://github.com/m-qm/project-brain">GitHub</Link>
  </>
);

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p className="site-footer-product">{PRODUCT_LINKS}</p>
        <nav className="site-footer-legal" aria-label="Legal and trust">
          <span className="site-footer-copy">
            © {year} {FOOTER_OPERATOR}
          </span>
          {FOOTER_LEGAL_LINKS.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
