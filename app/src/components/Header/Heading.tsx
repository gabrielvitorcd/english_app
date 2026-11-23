import { NavLink } from "react-router-dom";
import { AudioWaveform, Menu } from "lucide-react";
import { IconButton } from "../ui";
import styles from "./Heading.module.css";

export function Heading() {
  const tabs = [
    { name: "Home", path: "/" },
    { name: "Select", path: "/selectpath" },
    { name: "Player", path: "/player" },
    { name: "Progresso", path: "/progresso" },
    { name: "Shadowing", path: "/shadowing" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.brand_group}>
        <a href="/" className={styles.brand}>
          <AudioWaveform className={styles.brand_logo} aria-hidden="true" />
          <span className={styles.brand_text}>English<span>SRT</span></span>
        </a>
      </div>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <NavLink
            key={t.name}
            to={t.path}
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.on : ""}`
            }
          >
            {t.name}
          </NavLink>
        ))}
      </div>

      <IconButton className={styles.menu_btn} title="Menu" aria-label="Menu">
        <Menu aria-hidden="true" />
      </IconButton>
    </nav>
  );
}
