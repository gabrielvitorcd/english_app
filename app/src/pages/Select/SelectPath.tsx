import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Server, Upload } from "lucide-react";
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
    icon: <Upload aria-hidden="true" />,
    badge: "100% local",
    badgeIcon: Lock,
    number: "02",
  },
  {
    id: "offlinedocker",
    path: "/learnwatching/offlinedocker",
    label: "Biblioteca Offline",
    tagline: "Servidor próprio, biblioteca permanente",
    description:
      "Suba sua coleção via Docker. Streaming local com progresso persistente, sem depender de plataformas externas.",
    icon: <Server aria-hidden="true" />,
    badge: "Auto-hospedado",
    badgeIcon: Server,
    number: "03",
  },
];

export function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const navigate = useNavigate();
  const { setSession } = usePlayerSession();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted liga a animação de entrada depois do primeiro render; reescrever mudaria a animação
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
