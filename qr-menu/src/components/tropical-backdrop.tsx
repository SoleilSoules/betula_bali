// Backdrop for the public showcase. Two layers:
//  1) Cream paper grain — radial noise dots at very low opacity, gives the
//     bg a "printed menu paper" feel instead of flat #f1ece2.
//  2) Gzhel-style ornament — a tiny 4-petal flower + dots motif in the
//     theme's `--qr-rule` colour (blue on hideout, sand on coastal). Tile
//     is 320×320 so the motif breathes; opacity is low so it whispers
//     instead of shouting.
//
// Kept the file name `tropical-backdrop.tsx` even though motif is no
// longer tropical — renaming would churn imports across showcase. The
// component is now generic, theme-driven.

export function TropicalBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ color: "var(--qr-rule)" }}
    >
      <svg
        className="block h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.07 }}
      >
        <defs>
          <pattern
            id="qr-gzhel"
            x="0"
            y="0"
            width="320"
            height="320"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-4)"
          >
            {/* Central 4-petal flower */}
            <g transform="translate(80 80)">
              {[0, 90, 180, 270].map((rot) => (
                <ellipse
                  key={rot}
                  cx="0"
                  cy="-10"
                  rx="5"
                  ry="11"
                  fill="currentColor"
                  transform={`rotate(${rot})`}
                />
              ))}
              <circle r="3" fill="currentColor" />
            </g>

            {/* Three connector dots */}
            <g fill="currentColor">
              <circle cx="160" cy="40" r="1.8" />
              <circle cx="170" cy="55" r="1.4" />
              <circle cx="180" cy="42" r="1.6" />
            </g>

            {/* Smaller satellite flower */}
            <g transform="translate(220 200) scale(0.7)">
              {[0, 90, 180, 270].map((rot) => (
                <ellipse
                  key={rot}
                  cx="0"
                  cy="-9"
                  rx="4"
                  ry="9"
                  fill="currentColor"
                  transform={`rotate(${rot})`}
                />
              ))}
              <circle r="2.5" fill="currentColor" />
            </g>

            {/* Curved leaf-stem */}
            <path
              d="M 40 240 Q 60 220 90 230 Q 110 240 120 260"
              stroke="currentColor"
              strokeWidth="0.8"
              fill="none"
              opacity="0.6"
            />
            <ellipse cx="75" cy="226" rx="6" ry="2" fill="currentColor" transform="rotate(-20 75 226)" />
            <ellipse cx="105" cy="240" rx="6" ry="2" fill="currentColor" transform="rotate(20 105 240)" />

            {/* Subtle decorative cross-dots */}
            <g fill="currentColor" opacity="0.5">
              <circle cx="270" cy="100" r="1" />
              <circle cx="280" cy="105" r="1" />
              <circle cx="270" cy="110" r="1" />
              <circle cx="260" cy="105" r="1" />
            </g>
          </pattern>

          <pattern
            id="qr-grain"
            x="0"
            y="0"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.5" fill="var(--qr-text)" opacity="0.04" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#qr-grain)" />
        <rect width="100%" height="100%" fill="url(#qr-gzhel)" />
      </svg>
    </div>
  );
}
