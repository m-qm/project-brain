import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <Link href="https://agentkbase.com">Agent KBase</Link> · open source · pairs with{" "}
        <a href="https://skilltree.ai" target="_blank" rel="noopener noreferrer">
          SkillTree
        </a>{" "}
        ·{" "}
        <Link href="https://github.com/m-qm/project-brain">GitHub</Link>
      </p>
    </footer>
  );
}
