import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "accent" | "secondary" | "ghost" | "sei" | "nao-sei";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  block?: boolean;
};

/** Botão base (classes .btn de styles/components.css). Ícone Lucide vai em `children`. */
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "secondary", size = "md", block, className, type = "button", ...rest },
  ref,
) {
  const cls = ["btn", `btn--${variant}`, size === "lg" && "btn--lg", block && "btn--block", className]
    .filter(Boolean)
    .join(" ");
  return <button ref={ref} type={type} className={cls} {...rest} />;
});
