import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SourceCard, type Source } from "../../components/Select/SourceCard";
import { VideoSelectModal } from "../../components/Select/VideoSelectModal";
import { YoutubeLinkModal } from "../../components/Select/YoutubeLinkModal";
import styles from "./SelectPath.module.css";

const sources: Source[] = [
  {
    id: "youtube",
    path: "/learnwatching/youtube",
    label: "YouTube",
    tagline: "Aprenda com qualquer vídeo do YouTube",
    description:
      "Cole o link ou pesquise. Seu progresso fica salvo automaticamente — retome de onde parou, em qualquer dispositivo.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon
          points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    ),
    accent: "#FF4444",
    accentDim: "rgba(255,68,68,0.12)",
    badge: "Progresso salvo",
    badgeIcon: "✦",
    number: "01",
  },
  {
    id: "local",
    path: "/learnwatching/local",
    label: "Arquivo Local",
    tagline: "Seu vídeo, sua legenda, sua privacidade",
    description:
      "Importe MP4 + SRT direto do seu computador. Nada é enviado ao servidor. Perfeito para conteúdo offline e privado.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    accent: "#F5C842",
    accentDim: "rgba(245,200,66,0.10)",
    badge: "100% local",
    badgeIcon: "◆",
    number: "02",
  },
  {
    id: "offlinedocker",
    path: "/learnwatching/offlinedocker",
    label: "Biblioteca Offline",
    tagline: "Servidor próprio, biblioteca permanente",
    description:
      "Suba sua coleção via Docker. Streaming local com progresso persistente, sem depender de plataformas externas.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M7 8h.01M7 11h.01M10 8h4M10 11h4" strokeLinecap="round" />
      </svg>
    ),
    accent: "#4AAEFF",
    accentDim: "rgba(74,174,255,0.10)",
    badge: "Auto-hospedado",
    badgeIcon: "▲",
    number: "03",
  },
];

export function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVideoSelect = (videoFile: File, subtitleFile?: File) => {
    // TODO: Enviar para API quando configurada
    console.log("Vídeo selecionado:", videoFile);
    console.log("Legenda selecionada:", subtitleFile);

    // Navegar para player com os arquivos
    navigate("/player", {
      state: {
        videoFile,
        subtitleFile,
      },
    });
  };

  const handleYoutubeSubmit = (url: string) => {
    // TODO: Enviar para API quando configurada
    console.log("URL do YouTube enviada:", url);
    alert("Link recebido! Em breve será integrado com a API.");
  };

  return (
    <div className={`${styles.root} ${mounted ? styles.mounted : ""}`}>
      <main className={styles.grid}>
        {sources.map((source, i) => (
          <SourceCard
            key={source.id}
            source={source}
            index={i}
            onNavigate={(path) => {
              if (path === "/learnwatching/local") {
                setVideoModalOpen(true);
              } else if (path === "/learnwatching/youtube") {
                setYoutubeModalOpen(true);
              } else {
                navigate(path);
              }
            }}
          />
        ))}
      </main>

      <VideoSelectModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onSelect={handleVideoSelect}
      />

      <YoutubeLinkModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onSubmit={handleYoutubeSubmit}
      />
    </div>
  );
}
