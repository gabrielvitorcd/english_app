// Preferencias de renderizacao da legenda — persistidas em localStorage.
// Bump a versao da key ao mudar o shape de forma incompativel.

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

export type SubtitleSettings = {
  color: string;
  background: string;
  bgOpacity: number; // 0..1
  fontSize: number; // px
  fontFamily: string;
};

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  color: "#ffffff",
  background: "#000000",
  bgOpacity: 0.78,
  fontSize: 22,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const STORAGE_KEY = "englishsrt.subtitle-settings.v1";

function loadFromStorage(): SubtitleSettings {
  if (typeof window === "undefined") return DEFAULT_SUBTITLE_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SUBTITLE_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SUBTITLE_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SUBTITLE_SETTINGS;
  }
}

export function useSubtitleSettings() {
  const [settings, setSettings] = useState<SubtitleSettings>(loadFromStorage);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignora falha de storage (private mode / quota)
    }
  }, [settings]);

  const update = useCallback(
    <K extends keyof SubtitleSettings>(key: K, value: SubtitleSettings[K]) => {
      setSettings((s) => ({ ...s, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setSettings(DEFAULT_SUBTITLE_SETTINGS);
  }, []);

  return { settings, update, reset };
}

// #RGB, #RRGGBB, ou 'transparent' → rgba() string.
export function hexToRgba(hex: string, alpha: number): string {
  if (hex === "transparent") return "transparent";
  const clean = hex.replace("#", "");
  const isShort = clean.length === 3;
  const r = parseInt(isShort ? clean[0] + clean[0] : clean.substring(0, 2), 16);
  const g = parseInt(isShort ? clean[1] + clean[1] : clean.substring(2, 4), 16);
  const b = parseInt(isShort ? clean[2] + clean[2] : clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function subtitleStyle(s: SubtitleSettings): CSSProperties {
  return {
    color: s.color,
    backgroundColor: hexToRgba(s.background, s.bgOpacity),
    fontSize: `${s.fontSize}px`,
    fontFamily: s.fontFamily,
  };
}
