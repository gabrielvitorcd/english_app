import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SourceCard, type Source } from "../../components/Select/SourceCard";
import { VideoSelectModal } from "../../components/Select/VideoSelectModal";
import { usePlayerSession } from "../../contexts/PlayerSessionContext";
import styles from "./SelectPath.module.css";

const sources: Source[] = [
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
  const navigate = useNavigate();
  const { setSession } = usePlayerSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVideoSelect = (videoFile: File, subtitleFile?: File) => {
    if (!subtitleFile) {
      console.warn("Legenda obrigatória — sessão não iniciada");
      return;
    }
    // Guarda a sessao no contexto pra persistir enquanto o app estiver aberto
    setSession({ videoFile, subtitleFile });
    navigate("/player");
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
    </div>
  );
}
