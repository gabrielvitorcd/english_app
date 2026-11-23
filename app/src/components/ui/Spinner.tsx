type Props = { className?: string };

/** Indicador de carregamento (classe .spinner); para com movimento reduzido. */
export function Spinner({ className }: Props) {
  return <div className={["spinner", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}
