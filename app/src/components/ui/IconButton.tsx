import { forwardRef, type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Nome acessível: obrigatório, o botão só tem ícone. */
  "aria-label": string;
  /** Só visual: fundo --accent-soft e ícone --accent (controle ligado). */
  on?: boolean;
  /** Ícone de --icon-lg (24 px), como na barra do player. */
  large?: boolean;
};

/** Botão só com ícone, 44 × 44 (classes .icon-btn). Ícone Lucide vai em `children`. */
export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { on, large, className, type = "button", ...rest },
  ref,
) {
  const cls = ["icon-btn", on && "icon-btn--on", large && "icon-btn--lg", className]
    .filter(Boolean)
    .join(" ");
  return <button ref={ref} type={type} className={cls} {...rest} />;
});
