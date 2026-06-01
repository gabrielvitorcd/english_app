import { useState } from "react";

export interface SubtitleInfo {
  language_code: string;
  language_name: string;
  is_auto_generated: boolean;
}

export interface SubtitlesData {
  video_id?: string;
  video_title?: string;
  subtitles: SubtitleInfo[];
}

export interface UseSubtitlesReturn {
  subtitles: SubtitleInfo[] | null;
  isLoading: boolean;
  error: string | null;
  fetchSubtitles: (videoUrl: string) => Promise<SubtitleInfo[] | null>;
  clearSubtitles: () => void;
}

const API_BASE_URL = "http://localhost:8000";

export function useSubtitles(): UseSubtitlesReturn {
  const [subtitles, setSubtitles] = useState<SubtitleInfo[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubtitles = async (videoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setSubtitles(null);

    try {
      // Usando a rota consistente com Query Parameters
      const response = await fetch(
        `${API_BASE_URL}/api/subtitles/list?video_url=${encodeURIComponent(videoUrl)}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Falha ao buscar legendas");
      }

      const data = await response.json();
      // Garante que armazena a array de legendas (baseado no formato data.subtitles)
      const subtitlesList = data.subtitles || data;
      setSubtitles(subtitlesList);
      return subtitlesList; // Retorna para caso o componente queira usar o resultado imediatamente
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errMsg);
      setSubtitles(null);
      throw err; // Repassa o erro para o componente tratar localmente se necessário
    } finally {
      setIsLoading(false);
    }
  };

  const clearSubtitles = () => {
    setSubtitles(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    subtitles,
    isLoading,
    error,
    fetchSubtitles,
    clearSubtitles,
  };
}
