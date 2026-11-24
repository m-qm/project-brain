"use client";

type HeaderMenuToggleProps = {
  open: boolean;
  onToggle: () => void;
  menuLabel: string;
  closeLabel: string;
  controlsId: string;
};

export function HeaderMenuToggle({
  open,
  onToggle,
  menuLabel,
  closeLabel,
  controlsId,
}: HeaderMenuToggleProps) {
  const label = open ? closeLabel : menuLabel;

  return (
    <button
      type="button"
      className="nav-toggle"
      aria-expanded={open}
      aria-controls={controlsId}
      aria-label={label}
      onClick={onToggle}
    >
      <span className="nav-toggle-bars" aria-hidden data-open={open ? "true" : "false"}>
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
      </span>
    </button>
  );
}