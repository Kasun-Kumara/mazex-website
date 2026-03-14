"use client";

export default function MazeAnimation({
  size = 240,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const cellSize = size / 6;
  const walls = [
    // Outer walls
    { x1: 0, y1: 0, x2: size, y2: 0 },
    { x1: 0, y1: 0, x2: 0, y2: size },
    { x1: size, y1: 0, x2: size, y2: size },
    { x1: 0, y1: size, x2: size, y2: size },
    // Inner walls - horizontal
    { x1: cellSize, y1: cellSize, x2: cellSize * 3, y2: cellSize },
    { x1: cellSize * 4, y1: cellSize, x2: cellSize * 5, y2: cellSize },
    { x1: 0, y1: cellSize * 2, x2: cellSize, y2: cellSize * 2 },
    { x1: cellSize * 2, y1: cellSize * 2, x2: cellSize * 3, y2: cellSize * 2 },
    { x1: cellSize * 4, y1: cellSize * 2, x2: cellSize * 6, y2: cellSize * 2 },
    { x1: cellSize, y1: cellSize * 3, x2: cellSize * 2, y2: cellSize * 3 },
    { x1: cellSize * 3, y1: cellSize * 3, x2: cellSize * 4, y2: cellSize * 3 },
    { x1: 0, y1: cellSize * 4, x2: cellSize * 2, y2: cellSize * 4 },
    { x1: cellSize * 3, y1: cellSize * 4, x2: cellSize * 5, y2: cellSize * 4 },
    { x1: cellSize, y1: cellSize * 5, x2: cellSize * 3, y2: cellSize * 5 },
    { x1: cellSize * 4, y1: cellSize * 5, x2: cellSize * 5, y2: cellSize * 5 },
    // Inner walls - vertical
    { x1: cellSize, y1: 0, x2: cellSize, y2: cellSize },
    { x1: cellSize * 3, y1: cellSize, x2: cellSize * 3, y2: cellSize * 2 },
    { x1: cellSize * 5, y1: 0, x2: cellSize * 5, y2: cellSize },
    { x1: cellSize * 2, y1: cellSize * 2, x2: cellSize * 2, y2: cellSize * 3 },
    { x1: cellSize * 4, y1: cellSize * 3, x2: cellSize * 4, y2: cellSize * 4 },
    { x1: cellSize * 5, y1: cellSize * 3, x2: cellSize * 5, y2: cellSize * 5 },
    { x1: cellSize * 2, y1: cellSize * 4, x2: cellSize * 2, y2: cellSize * 5 },
    { x1: cellSize * 3, y1: cellSize * 5, x2: cellSize * 3, y2: cellSize * 6 },
  ];

  const robotRadius = cellSize * 0.2;

  return (
    <div className={`relative ${className}`}>
      {/* Glow background */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(44, 125, 160, 0.15) 0%, transparent 70%)",
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10"
      >
        {/* Grid lines (faint) */}
        {Array.from({ length: 7 }).map((_, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={i * cellSize}
              y1={0}
              x2={i * cellSize}
              y2={size}
              stroke="#1B4965"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1={0}
              y1={i * cellSize}
              x2={size}
              y2={i * cellSize}
              stroke="#1B4965"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </g>
        ))}

        {/* Maze walls */}
        {walls.map((wall, i) => (
          <line
            key={`wall-${i}`}
            x1={wall.x1}
            y1={wall.y1}
            x2={wall.x2}
            y2={wall.y2}
            stroke="#2C7DA0"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 4px rgba(44, 125, 160, 0.6))",
            }}
          />
        ))}

        {/* Start marker */}
        <rect
          x={cellSize * 0.15}
          y={cellSize * 0.15}
          width={cellSize * 0.7}
          height={cellSize * 0.7}
          rx={4}
          fill="#2C7DA0"
          opacity="0.2"
        />
        <text
          x={cellSize * 0.5}
          y={cellSize * 0.55}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#61A5C2"
          fontSize={cellSize * 0.25}
          fontFamily="monospace"
        >
          START
        </text>

        {/* End marker */}
        <rect
          x={cellSize * 5.15}
          y={cellSize * 5.15}
          width={cellSize * 0.7}
          height={cellSize * 0.7}
          rx={4}
          fill="#61A5C2"
          opacity="0.2"
        />
        <text
          x={cellSize * 5.5}
          y={cellSize * 5.55}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#A9D6E5"
          fontSize={cellSize * 0.25}
          fontFamily="monospace"
        >
          END
        </text>

        {/* Robot dot */}
        <circle
          r={robotRadius}
          fill="#61A5C2"
          className="animate-robot"
          style={{
            filter: "drop-shadow(0 0 8px rgba(97, 165, 194, 0.8))",
          }}
        >
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Robot trail (faint) */}
        <circle
          r={robotRadius * 0.6}
          fill="#2C7DA0"
          className="animate-robot"
          opacity="0.3"
          style={{
            animationDelay: "-0.3s",
            filter: "drop-shadow(0 0 4px rgba(44, 125, 160, 0.4))",
          }}
        />
      </svg>
    </div>
  );
}
