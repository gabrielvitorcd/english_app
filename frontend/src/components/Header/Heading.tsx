import { NavLink } from "react-router-dom";
import styles from "./Heading.module.css";

export function Heading() {
  const tabs = [
    { name: "Select", path: "/selectpath" },
    { name: "Player", path: "/player" },
    { name: "Progresso", path: "/progresso" },
    { name: "Shadowing", path: "/shadowing" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.brand_group}>
        <a href="/" className={styles.brand}>
          Listening
        </a>
        <span className={styles.epLabel}>Ep1 - Title do EP</span>
      </div>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <NavLink
            key={t.name}
            to={t.path}
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.on : ""}`
            }
            style={{ textDecoration: "none" }}
          >
            {t.name}
          </NavLink>
        ))}
      </div>

      <button className={styles.menu_btn} title="Menu">
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6H20M4 12H20M4 18H20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </nav>
  );
}
