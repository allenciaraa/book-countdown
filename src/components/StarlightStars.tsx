interface Star {
  left: string;
  top: string;
  size: string;
  gold: boolean;
  slow: boolean;
  duration: string;
  delay: string;
}

// Deterministic sin-based hash so the star field is stable across renders
// instead of reshuffling on every re-render.
function buildStars(): Star[] {
  return Array.from({ length: 44 }, (_, i) => {
    const rand = (n: number) => {
      const x = Math.sin((i + 1) * n) * 10000;
      return x - Math.floor(x);
    };
    const gold = i % 4 === 0;
    const size = (0.9 + rand(12.9898) * 1.8).toFixed(2);
    return {
      left: `${(rand(78.233) * 100).toFixed(2)}%`,
      top: `${(rand(43.7719) * 100).toFixed(2)}%`,
      size: `${size}px`,
      gold,
      slow: i % 3 === 0,
      duration: `${(2.2 + rand(93.9898) * 3.4).toFixed(2)}s`,
      delay: `${(rand(21.42) * 4).toFixed(2)}s`,
    };
  });
}

const STARS = buildStars();

export function StarlightStars() {
  return (
    <div className="stars-layer" aria-hidden="true">
      {STARS.map((star, i) => (
        <span
          key={i}
          className={`star ${star.gold ? "star--gold" : "star--white"} ${star.slow ? "star--slow" : "star--fast"}`}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
