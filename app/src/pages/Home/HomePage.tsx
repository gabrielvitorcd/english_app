import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";

export function HomePage() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Qualquer Vídeo",
      description: "YouTube, arquivos locais ou sua biblioteca pessoal. Use o conteúdo que você já ama.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      title: "Qualquer Idioma",
      description: "Legendas em qualquer língua. Clique em palavras para ver tradução instantânea.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Acompanhe seu Progresso",
      description: "Dashboard com vocabulário aprendido e tempo de prática. Evolua a cada sessão.",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      title: "Shadowing",
      description: "Repita frases em voz alta e grave sua pronúncia. Compare com o original.",
    },
  ];

  const sources = [
    {
      id: "youtube",
      label: "YouTube",
      description: "Aprenda com qualquer vídeo do YouTube",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
        </svg>
      ),
      color: "#FF4444",
      path: "/learnwatching/youtube",
    },
    {
      id: "local",
      label: "Arquivo Local",
      description: "Importe vídeos e legendas do seu computador",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      color: "#F5C842",
      path: "/learnwatching/local",
    },
    {
      id: "library",
      label: "Biblioteca",
      description: "Acesse sua coleção de vídeos salvos",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
          <path d="M7 8h.01M7 11h.01M10 8h4M10 11h4" strokeLinecap="round" />
        </svg>
      ),
      color: "#4AAEFF",
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
            <button
              className={styles.btn_primary}
              onClick={() => navigate("/selectpath")}
            >
              Começar agora
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className={styles.btn_secondary}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Ver demo
            </button>
          </div>
        </div>
        <div className={styles.hero_visual}>
          <div className={styles.video_mock}>
            <div className={styles.video_screen}>
              <div className={styles.play_button}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
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
              className={`${styles.feature_card} ${mounted ? styles.fadeIn : ""}`}
              style={{ animationDelay: `${i * 100}ms` }}
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
              className={`${styles.source_card} ${mounted ? styles.fadeIn : ""}`}
              style={{ animationDelay: `${i * 100 + 300}ms` }}
              onClick={() => navigate(source.path)}
            >
              <div className={styles.source_icon} style={{ color: source.color }}>
                {source.icon}
              </div>
              <h3 className={styles.source_title}>{source.label}</h3>
              <p className={styles.source_desc}>{source.description}</p>
              <div className={styles.source_arrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
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
          <button
            className={styles.btn_large}
            onClick={() => navigate("/selectpath")}
          >
            Começar gratuitamente
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 English SRT. Aprenda inglês de forma natural.</p>
      </footer>
    </div>
  );
}
