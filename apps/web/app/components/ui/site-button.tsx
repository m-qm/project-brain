"use client";

import type { ButtonActionDetails } from "@ui-sdk/react/button";
import { Button } from "@ui-sdk/react/button";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export type SiteButtonVariant = "primary" | "secondary" | "ghost";

const VARIANT_CLASS: Record<SiteButtonVariant, string> = {
  primary: "btn",
  secondary: "btn secondary",
  ghost: "btn ghost",
};

type SiteButtonProps = {
  children: ReactNode;
  variant?: SiteButtonVariant;
  className?: string;
  disabled?: boolean;
  href?: string;
  external?: boolean;
  locale?: string;
  type?: "button" | "submit";
  title?: string;
  pendingAnnouncement?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>, details: ButtonActionDetails) => unknown;
};

function joinClass(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SiteButton({
  children,
  variant = "primary",
  className,
  disabled,
  href,
  external,
  locale,
  type = "button",
  title,
  pendingAnnouncement,
  onClick,
}: SiteButtonProps) {
  const classes = joinClass(VARIANT_CLASS[variant], className);

  if (href) {
    const externalLink =
      external || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
    if (externalLink) {
      return (
        <Button
          className={classes}
          disabled={disabled}
          focusableWhenDisabled={false}
          title={title}
          onClick={onClick}
          render={
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            />
          }
        >
          {children}
        </Button>
      );
    }
    const linkProps: ComponentProps<typeof Link> = { href };
    if (locale) linkProps.locale = locale as "en" | "es";
    return (
      <Button className={classes} disabled={disabled} title={title} onClick={onClick} render={<Link {...linkProps} />}>
        {children}
      </Button>
    );
  }

  return (
    <Button
      className={classes}
      type={type}
      disabled={disabled}
      title={title}
      pendingAnnouncement={pendingAnnouncement}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}