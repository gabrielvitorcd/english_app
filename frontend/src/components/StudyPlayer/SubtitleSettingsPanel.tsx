// Painel de customizacao da legenda (estilo Netflix).
// Controla cor do texto, cor+opacidade do fundo, tamanho e familia de fonte.

import type { SubtitleSettings } from "../../hooks/useSubtitleSettings";
import styles from "./SubtitleSettingsPanel.module.css";

const COLOR_PRESETS = [
  "#ffffff",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#ff00ff",
  "#ff5555",
  "#ff9900",
  "#000000",
];

const BG_PRESETS = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#0000ff",
  "#00ff00",
  "#ffff00",
  "transparent",
];

const FONT_OPTIONS: { label: string; value: string }[] = [
  {
    label: "Padrão",
    value:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  { label: "Sans-serif", value: "Arial, Helvetica, sans-serif" },
  { label: "Serif", value: "'Times New Roman', Times, serif" },
  { label: "Monospace", value: "'Courier New', Courier, monospace" },
  { label: "Casual", value: "'Comic Sans MS', 'Chalkboard SE', cursive" },
  {
    label: "Fina",
    value: "'Helvetica Neue', 'Arial Narrow', sans-serif",
  },
];

type Props = {
  settings: SubtitleSettings;
  update: <K extends keyof SubtitleSettings>(
    key: K,
    value: SubtitleSettings[K]
  ) => void;
  reset: () => void;
  onClose: () => void;
};

export function SubtitleSettingsPanel({
  settings,
  update,
  reset,
  onClose,
}: Props) {
  return (
    <div
      className={styles.panel}
      role="dialog"
      aria-label="Configurações de legenda"
    >
      <div className={styles.header}>
        <h4 className={styles.title}>Legenda</h4>
        <button
          className={styles.close}
          onClick={onClose}
          type="button"
          aria-label="Fechar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Cor do texto</div>
        <div className={styles.swatches}>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.swatch} ${
                settings.color === c ? styles.swatchActive : ""
              }`}
              style={{ background: c }}
              onClick={() => update("color", c)}
              aria-label={`Cor ${c}`}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Cor do fundo</div>
        <div className={styles.swatches}>
          {BG_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.swatch} ${
                settings.background === c ? styles.swatchActive : ""
              } ${c === "transparent" ? styles.swatchTransparent : ""}`}
              style={c !== "transparent" ? { background: c } : undefined}
              onClick={() => update("background", c)}
              aria-label={`Fundo ${c === "transparent" ? "transparente" : c}`}
              title={c === "transparent" ? "transparente" : c}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Opacidade do fundo</span>
          <span className={styles.value}>
            {Math.round(settings.bgOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(settings.bgOpacity * 100)}
          onChange={(e) =>
            update("bgOpacity", Number(e.target.value) / 100)
          }
          className={styles.slider}
          aria-label="Opacidade do fundo"
        />
      </div>

      <div className={styles.section}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Tamanho</span>
          <span className={styles.value}>{settings.fontSize}px</span>
        </div>
        <input
          type="range"
          min={12}
          max={56}
          step={1}
          value={settings.fontSize}
          onChange={(e) => update("fontSize", Number(e.target.value))}
          className={styles.slider}
          aria-label="Tamanho da fonte"
        />
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Fonte</div>
        <select
          value={settings.fontFamily}
          onChange={(e) => update("fontFamily", e.target.value)}
          className={styles.select}
          aria-label="Família de fonte"
        >
          {FONT_OPTIONS.map((f) => (
            <option
              key={f.label}
              value={f.value}
              style={{ fontFamily: f.value }}
            >
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <button className={styles.reset} onClick={reset} type="button">
        Restaurar padrão
      </button>
    </div>
  );
}
