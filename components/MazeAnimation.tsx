"use client";

import React, {
  useMemo,
  useId,
} from "react";
import { motion } from "framer-motion";

const MAZE_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const GRID_ROWS = MAZE_GRID.length;
const GRID_COLS = MAZE_GRID[0].length;

const START: [number, number] = [1, 1];
const END: [number, number] = [11, 11];

function bfs(
  grid: number[][],
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(false)
  );
  const queue: { pos: [number, number]; path: [number, number][] }[] = [];

  queue.push({ pos: start, path: [start] });
  visited[start[0]][start[1]] = true;

  const dirs: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    const [r, c] = pos;

    if (r === end[0] && c === end[1]) {
      return path;
    }

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc] !== 0) continue;
      if (visited[nr][nc]) continue;

      visited[nr][nc] = true;
      queue.push({ pos: [nr, nc], path: [...path, [nr, nc]] });
    }
  }

  return [start];
}

function cellCenter(row: number, col: number, cellSize: number) {
  return {
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2,
  };
}

export default function MazeAnimation({
  size = 240,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const mazeId = useId().replace(/:/g, "");
  const cellSize = size / GRID_COLS;
  const path = useMemo(() => bfs(MAZE_GRID, START, END), []);
  const pixelPath = useMemo(
    () => path.map(([r, c]) => cellCenter(r, c, cellSize)),
    [path, cellSize]
  );

  const robotRadius = cellSize * 0.15;
  const passageClipId = `${mazeId}-passage-clip`;
  const wallGlowId = `${mazeId}-wall-glow`;
  const robotGlowId = `${mazeId}-robot-glow`;
  const robotGradId = `${mazeId}-robot-grad`;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10 block h-full w-full"
      >
        <defs>
          <filter id={wallGlowId} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={robotGlowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id={robotGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#818CF8" />
          </radialGradient>

          <clipPath id={passageClipId}>
            {MAZE_GRID.map((row, ri) =>
              row.map((cell, ci) =>
                cell === 0 ? (
                  <rect
                    key={`pc-${ri}-${ci}`}
                    x={ci * cellSize}
                    y={ri * cellSize}
                    width={cellSize}
                    height={cellSize}
                  />
                ) : null
              )
            )}
          </clipPath>
        </defs>

        {MAZE_GRID.map((row, ri) =>
          row.map((cell, ci) => (
            <rect
              key={`g-${ri}-${ci}`}
              x={ci * cellSize}
              y={ri * cellSize}
              width={cellSize}
              height={cellSize}
              fill={cell === 1 ? "#0F1730" : "#050915"}
              stroke={cell === 1 ? "#1B2440" : "#11182D"}
              strokeWidth={cell === 1 ? "0.5" : "0.2"}
            />
          ))
        )}

        {MAZE_GRID.map((row, ri) =>
          row.map((cell, ci) => {
            if (cell !== 1) return null;

            const segs: React.JSX.Element[] = [];

            if (ri > 0 && MAZE_GRID[ri - 1][ci] === 0) {
              segs.push(
                <line
                  key={`et-${ri}-${ci}`}
                  x1={ci * cellSize}
                  y1={ri * cellSize}
                  x2={(ci + 1) * cellSize}
                  y2={ri * cellSize}
                  stroke="#A855F7"
                  strokeWidth="1.5"
                  filter={`url(#${wallGlowId})`}
                />
              );
            }

            if (ri < GRID_ROWS - 1 && MAZE_GRID[ri + 1][ci] === 0) {
              segs.push(
                <line
                  key={`eb-${ri}-${ci}`}
                  x1={ci * cellSize}
                  y1={(ri + 1) * cellSize}
                  x2={(ci + 1) * cellSize}
                  y2={(ri + 1) * cellSize}
                  stroke="#A855F7"
                  strokeWidth="1.5"
                  filter={`url(#${wallGlowId})`}
                />
              );
            }

            if (ci > 0 && MAZE_GRID[ri][ci - 1] === 0) {
              segs.push(
                <line
                  key={`el-${ri}-${ci}`}
                  x1={ci * cellSize}
                  y1={ri * cellSize}
                  x2={ci * cellSize}
                  y2={(ri + 1) * cellSize}
                  stroke="#A855F7"
                  strokeWidth="1.5"
                  filter={`url(#${wallGlowId})`}
                />
              );
            }

            if (ci < GRID_COLS - 1 && MAZE_GRID[ri][ci + 1] === 0) {
              segs.push(
                <line
                  key={`er-${ri}-${ci}`}
                  x1={(ci + 1) * cellSize}
                  y1={ri * cellSize}
                  x2={(ci + 1) * cellSize}
                  y2={(ri + 1) * cellSize}
                  stroke="#A855F7"
                  strokeWidth="1.5"
                  filter={`url(#${wallGlowId})`}
                />
              );
            }

            return segs;
          })
        )}

        <polyline
          points={pixelPath.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#818CF8"
          strokeWidth="1"
          opacity="0.12"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        <rect
          x={START[1] * cellSize + cellSize * 0.12}
          y={START[0] * cellSize + cellSize * 0.12}
          width={cellSize * 0.76}
          height={cellSize * 0.76}
          rx={3}
          fill="#A855F7"
          opacity="0.22"
        />
        <text
          x={START[1] * cellSize + cellSize / 2}
          y={START[0] * cellSize + cellSize / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#C084FC"
          fontSize={Math.max(7, cellSize * 0.38)}
          fontFamily="monospace"
          fontWeight="bold"
        >
          S
        </text>

        <rect
          x={END[1] * cellSize + cellSize * 0.12}
          y={END[0] * cellSize + cellSize * 0.12}
          width={cellSize * 0.76}
          height={cellSize * 0.76}
          rx={3}
          fill="#818CF8"
          opacity="0.22"
        />
        <text
          x={END[1] * cellSize + cellSize / 2}
          y={END[0] * cellSize + cellSize / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#E2E8F0"
          fontSize={Math.max(7, cellSize * 0.38)}
          fontFamily="monospace"
          fontWeight="bold"
        >
          E
        </text>

        <g clipPath={`url(#${passageClipId})`}>
          <motion.circle
            animate={{ 
              cx: pixelPath.map(p => p.x), 
              cy: pixelPath.map(p => p.y) 
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 1.5
            }}
            r={robotRadius * 2.2}
            fill="none"
            stroke="#818CF8"
            strokeWidth="0.6"
            opacity="0.2"
          />

          <motion.circle
            animate={{ 
              cx: pixelPath.map(p => p.x), 
              cy: pixelPath.map(p => p.y) 
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 1.5
            }}
            r={robotRadius * 1.8}
            fill="#C084FC"
            opacity="0.12"
          />

          <motion.circle
            animate={{ 
              cx: pixelPath.map(p => p.x), 
              cy: pixelPath.map(p => p.y) 
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 1.5
            }}
            r={robotRadius}
            fill={`url(#${robotGradId})`}
            filter={`url(#${robotGlowId})`}
          />
        </g>
      </svg>
    </div>
  );
}
