import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <main className="page-main container-narrow" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h1 className="page-title">Page not found</h1>
        <p className="page-lead">This route is not in the brain map.</p>
        <Link className="btn" href="/">
          Home
        </Link>
      </main>
    </div>
  );
}
