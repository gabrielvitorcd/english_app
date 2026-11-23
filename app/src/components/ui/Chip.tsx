import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger";
};

/** Cápsula de 28 px (classes .chip): selo de cartão ou veredito. */
export function Chip({ tone = "neutral", className, ...rest }: Props) {
  const cls = ["chip", tone !== "neutral" && `chip--${tone}`, className].filter(Boolean).join(" ");
  return <span className={cls} {...rest} />;
}
