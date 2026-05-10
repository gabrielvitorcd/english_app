import { NavLink } from "react-router-dom";
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
          <div className={styles.brand_logo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
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

      <button className={styles.menu_btn} title="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6H20M4 12H20M4 18H20" strokeLinecap="round" />
        </svg>
      </button>
    </nav>
  );
}
