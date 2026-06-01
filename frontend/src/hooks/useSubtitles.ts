import { useState } from "react";

export interface SubtitleInfo {
  language_code: string;
  language_name: string;
  is_auto_generated: boolean;
}

export interface SubtitlesData {
  video_id: string;
  video_title: string;
  subtitles: SubtitleInfo[];
}

export interface UseSubtitlesReturn {
  subtitles: SubtitlesData | null;
  isLoading: boolean;
  error: string | null;
  fetchSubtitles: (videoUrl: string) => Promise<void>;
  clearSubtitles: () => void;
}

const API_BASE_URL = "http://localhost:8000";

export function useSubtitles(): UseSubtitlesReturn {
  const [subtitles, setSubtitles] = useState<SubtitlesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubtitles = async (videoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setSubtitles(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/subtitles/${encodeURIComponent(videoUrl)}`,
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Falha ao buscar legendas");
      }

      const data = await response.json();
      setSubtitles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setSubtitles(null);
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
