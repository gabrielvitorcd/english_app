import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChartColumn,
  CirclePlay,
  Languages,
  Mic,
  MonitorPlay,
  Play,
  Server,
  Upload,
} from "lucide-react";
import { Button } from "../../components/ui";
import styles from "./HomePage.module.css";

export function HomePage() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted liga a animação de entrada depois do primeiro render; reescrever mudaria a animação
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <CirclePlay aria-hidden="true" />,
      title: "Qualquer Vídeo",
      description: "YouTube, arquivos locais ou sua biblioteca pessoal. Use o conteúdo que você já ama.",
    },
    {
      icon: <Languages aria-hidden="true" />,
      title: "Qualquer Idioma",
      description: "Legendas em qualquer língua. Clique em palavras para ver tradução instantânea.",
    },
    {
      icon: <ChartColumn aria-hidden="true" />,
      title: "Acompanhe seu Progresso",
      description: "Dashboard com vocabulário aprendido e tempo de prática. Evolua a cada sessão.",
    },
    {
      icon: <Mic aria-hidden="true" />,
      title: "Shadowing",
      description: "Repita frases em voz alta e grave sua pronúncia. Compare com o original.",
    },
  ];

  const sources = [
    {
      id: "youtube",
      label: "YouTube",
      description: "Aprenda com qualquer vídeo do YouTube",
      icon: <MonitorPlay aria-hidden="true" />,
      path: "/learnwatching/youtube",
    },
    {
      id: "local",
      label: "Arquivo Local",
      description: "Importe vídeos e legendas do seu computador",
      icon: <Upload aria-hidden="true" />,
      path: "/learnwatching/local",
    },
    {
      id: "library",
      label: "Biblioteca",
      description: "Acesse sua coleção de vídeos salvos",
      icon: <Server aria-hidden="true" />,
      path: "/learnwatching/library",
    },
  ];

  return (
    <div className={`${styles.root} ${mounted ? styles.mounted : ""}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.hero_content}>
          <h1 className={styles.hero_title}>
            Aprenda inglês com{" "}
            <span className={styles.hero_highlight}>qualquer vídeo</span>
          </h1>
          <p className={styles.hero_subtitle}>
            Assista seus vídeos favoritos com legendas sincronizadas.
            Clique em palavras para traduzir. Evolua naturalmente.
          </p>
          <div className={styles.hero_ctas}>
            <Button
              variant="accent"
              size="lg"
              className={styles.btn_primary}
              onClick={() => navigate("/selectpath")}
            >
              Começar agora
              <ArrowRight aria-hidden="true" />
            </Button>
            <Button variant="secondary" size="lg" className={styles.btn_secondary}>
              <Play aria-hidden="true" />
              Ver demo
            </Button>
          </div>
        </div>
        <div className={styles.hero_visual}>
          <div className={`palco ${styles.video_mock}`}>
            <div className={styles.video_screen}>
              <div className={styles.play_button}>
                <Play aria-hidden="true" />
              </div>
              <div className={styles.subtitle_mock}>
                <span>That's what she said!</span>
              </div>
            </div>
            <div className={styles.video_controls}>
              <div className={styles.progress_bar}>
                <div className={styles.progress_fill}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.section_title}>Como funciona</h2>
        <div className={styles.features_grid}>
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`card card--lg ${styles.feature_card} ${mounted ? styles.fadeIn : ""}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              <div className={styles.feature_icon}>{feature.icon}</div>
              <h3 className={styles.feature_title}>{feature.title}</h3>
              <p className={styles.feature_desc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sources Section */}
      <section className={styles.sources}>
        <h2 className={styles.section_title}>Escolha sua fonte</h2>
        <p className={styles.section_subtitle}>
          Use qualquer vídeo que você já ama assistir
        </p>
        <div className={styles.sources_grid}>
          {sources.map((source, i) => (
            <button
              key={source.id}
              className={`card card--lg card--interactive ${styles.source_card} ${mounted ? styles.fadeIn : ""}`}
              style={{ "--i": i + 3 } as React.CSSProperties}
              onClick={() => navigate(source.path)}
            >
              <div className={styles.source_icon}>
                {source.icon}
              </div>
              <h3 className={styles.source_title}>{source.label}</h3>
              <p className={styles.source_desc}>{source.description}</p>
              <div className={styles.source_arrow}>
                <ArrowRight aria-hidden="true" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.cta_content}>
          <h2 className={styles.cta_title}>Pronto para começar?</h2>
          <p className={styles.cta_desc}>
            Milhares de pessoas já estão melhorando seu inglês de forma natural e divertida.
          </p>
          <Button
            variant="accent"
            size="lg"
            className={styles.btn_large}
            onClick={() => navigate("/selectpath")}
          >
            Começar gratuitamente
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 English SRT. Aprenda inglês de forma natural.</p>
      </footer>
    </div>
  );
}
