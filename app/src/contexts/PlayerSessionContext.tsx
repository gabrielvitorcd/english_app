// Guarda a sessao ativa do player (arquivos de video + legenda).
//
// Duas camadas de persistencia:
//   1. Estado React em memoria (reativo)
//   2. IndexedDB — hidratado no boot e escrito em cada set/clear.
// Sobrevive a fechar/reabrir a aba.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredSession,
  loadSession,
  saveSession,
} from "../lib/sessionDb";

export type PlayerSession = {
  videoFile: File;
  subtitleFile: File;
};

type ContextValue = {
  session: PlayerSession | null;
  /** false enquanto ainda estamos lendo do IndexedDB no boot */
  hydrated: boolean;
  setSession: (s: PlayerSession) => void;
  clearSession: () => void;
};

const PlayerSessionContext = createContext<ContextValue | null>(null);

export function PlayerSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<PlayerSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hidratacao inicial a partir do IndexedDB
  useEffect(() => {
    let cancelled = false;
    loadSession()
      .then((s) => {
        if (!cancelled && s) setSessionState(s);
      })
      .catch((err) => {
        console.warn("[PlayerSession] falha lendo IndexedDB:", err);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback((s: PlayerSession) => {
    setSessionState(s);
    saveSession(s).catch((err) =>
      console.warn("[PlayerSession] falha gravando IndexedDB:", err)
    );
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    clearStoredSession().catch((err) =>
      console.warn("[PlayerSession] falha limpando IndexedDB:", err)
    );
  }, []);

  const value = useMemo<ContextValue>(
    () => ({ session, hydrated, setSession, clearSession }),
    [session, hydrated, setSession, clearSession]
  );

  return (
    <PlayerSessionContext.Provider value={value}>
      {children}
    </PlayerSessionContext.Provider>
  );
}

export function usePlayerSession(): ContextValue {
  const ctx = useContext(PlayerSessionContext);
  if (!ctx) {
    throw new Error(
      "usePlayerSession precisa estar dentro de <PlayerSessionProvider>"
    );
  }
  return ctx;
}
