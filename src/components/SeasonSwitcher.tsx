import type { Season } from "../types";

interface SeasonSwitcherProps {
  season: Season;
  onChange: (season: Season) => void;
}

const LABELS: Record<Season, string> = { night: "Starlight", spring: "Spring", fall: "Autumn" };

// The spring flower's centre dot is meant to read as a punched-through hole: it
// matches the plate background when the button is inactive, or blends into the
// button's own accent fill when spring is the active season.
const ACCENT: Record<Season, string> = { night: "#e8cf7a", spring: "#c2547e", fall: "#b5551d" };
const PLATE_BG: Record<Season, string> = { night: "#07061a", spring: "#f6f0e2", fall: "#eddcbb" };

function seasonIcon(id: Season, season: Season) {
  switch (id) {
    case "night":
      return (
        <svg viewBox="0 0 24 24" width="52%" height="52%" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.1 6.4H21l-5.4 4 2.1 6.5L12 15l-5.7 3.9 2.1-6.5-5.4-4h6.9z" />
        </svg>
      );
    case "spring": {
      const centerFill = season === "spring" ? ACCENT.spring : PLATE_BG[season];
      return (
        <svg viewBox="0 0 24 24" width="55%" height="55%" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="6.2" r="3.5" />
          <circle cx="17.6" cy="10.3" r="3.5" />
          <circle cx="15.4" cy="16.9" r="3.5" />
          <circle cx="8.6" cy="16.9" r="3.5" />
          <circle cx="6.4" cy="10.3" r="3.5" />
          <circle cx="12" cy="12" r="2.4" fill={centerFill} />
        </svg>
      );
    }
    case "fall":
      return (
        <svg viewBox="0 0 24 24" width="55%" height="55%" aria-hidden="true">
          <path
            d="M20 3C11.5 3.6 5.8 7.2 4.4 13.2c-.5 2.2-.2 4.3.7 6l1.7-1c-.7-1.4-.9-3-.5-4.7C7.5 8.4 12.7 5.4 20 3z"
            fill="currentColor"
          />
          <path
            d="M19.6 3.4C13.4 5.6 8.6 8.6 6.6 13.6c-.8 2-.9 3.9-.4 5.4 4.9.9 9.2-1 11.5-5 1.7-3 2.2-6.9 1.9-10.6z"
            fill="currentColor"
            opacity=".55"
          />
        </svg>
      );
  }
}

const SEASON_IDS: Season[] = ["night", "spring", "fall"];

export function SeasonSwitcher({ season, onChange }: SeasonSwitcherProps) {
  return (
    <div className="switcher">
      <div className="switcher-divider-row">
        <span className="switcher-divider-line" />
        <span className="switcher-label">choose your court</span>
        <span className="switcher-divider-line" />
      </div>
      <div className="switcher-buttons">
        {SEASON_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`switcher-button${season === id ? " switcher-button--active" : ""}`}
            aria-pressed={season === id}
            aria-label={`${LABELS[id]} theme`}
            title={LABELS[id]}
            onClick={() => onChange(id)}
          >
            {seasonIcon(id, season)}
          </button>
        ))}
      </div>
    </div>
  );
}
