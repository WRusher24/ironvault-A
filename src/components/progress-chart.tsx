"use client";

import { useMemo, useState } from "react";
import { formatDateEnShort, formatWeight } from "@/lib/format";

export interface ChartPoint {
  id: string;
  date: string;
  weight: number;
  reps: number;
  isPr: boolean;
}

const W = 720;
const H = 320;
const PAD = { top: 46, bottom: 40, start: 26, end: 56 };

/**
 * Clean SVG progression chart — weight over time.
 * Simple, uncluttered line chart with no PR badges or highlights.
 */
export default function ProgressChart({ points }: { points: ChartPoint[] }) {
  const [active, setActive] = useState<ChartPoint | null>(
    points.length > 0 ? points[points.length - 1] : null,
  );

  const geo = useMemo(() => {
    if (points.length === 0) return null;
    const weights = points.map((p) => p.weight);
    let min = Math.min(...weights);
    let max = Math.max(...weights);
    if (min === max) {
      min = Math.max(0, min - 5);
      max = max + 5;
    } else {
      const pad = (max - min) * 0.18;
      min = Math.max(0, min - pad);
      max = max + pad;
    }

    const innerW = W - PAD.start - PAD.end;
    const innerH = H - PAD.top - PAD.bottom;
    const n = points.length;

    // Strictly chronological reading: index 0 (oldest) on the far LEFT,
    // newest on the far RIGHT — natural left-to-right time progression.
    const x = (i: number) =>
      n === 1 ? PAD.start + innerW / 2 : PAD.start + (i / (n - 1)) * innerW;
    const y = (w: number) => PAD.top + innerH - ((w - min) / (max - min)) * innerH;

    const coords = points.map((p, i) => ({
      ...p,
      cx: x(i),
      cy: y(p.weight),
    }));

    // Catmull-Rom to cubic bezier for a smooth line.
    let d = `M ${coords[0].cx} ${coords[0].cy}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[Math.max(0, i - 1)];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[Math.min(coords.length - 1, i + 2)];
      const c1x = p1.cx + (p2.cx - p0.cx) / 6;
      const c1y = p1.cy + (p2.cy - p0.cy) / 6;
      const c2x = p2.cx - (p3.cx - p1.cx) / 6;
      const c2y = p2.cy - (p3.cy - p1.cy) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.cx} ${p2.cy}`;
    }

    const area = `${d} L ${coords[coords.length - 1].cx} ${H - PAD.bottom} L ${coords[0].cx} ${H - PAD.bottom} Z`;

    const gridLines = Array.from({ length: 4 }, (_, i) => {
      const w = min + ((max - min) / 3) * i;
      return { w, cy: y(w) };
    });

    return { coords, d, area, gridLines, min, max };
  }, [points]);

  if (!geo) return null;

  const labelIdx = [0, Math.floor((geo.coords.length - 1) / 2), geo.coords.length - 1].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  return (
    <div className="relative" dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Weight progression over time"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F95C4B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#F95C4B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {geo.gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD.start}
              x2={W - PAD.end}
              y1={g.cy}
              y2={g.cy}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="4 6"
            />
            <text
              x={W - PAD.end + 10}
              y={g.cy + 4}
              fontSize="17"
              fill="#a3a3a3"
              fontWeight="700"
            >
              {formatWeight(Math.round(g.w * 10) / 10)}
            </text>
          </g>
        ))}

        {/* Area + line */}
        <path d={geo.area} fill="url(#areaGrad)" />
        <path
          d={geo.d}
          fill="none"
          stroke="#F95C4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Points — clean, uniform circles */}
        {geo.coords.map((p) => {
          const isActive = active?.id === p.id;
          return (
            <g
              key={p.id}
              onClick={() => setActive(p)}
              className="cursor-pointer"
              style={{ pointerEvents: "all" }}
            >
              {/* Touch target */}
              <circle cx={p.cx} cy={p.cy} r="24" fill="transparent" />
              <circle
                cx={p.cx}
                cy={p.cy}
                r={isActive ? 7 : 5}
                fill="#F95C4B"
                stroke={isActive ? "#000000" : "#ffffff"}
                strokeWidth={isActive ? 3 : 2}
              />
            </g>
          );
        })}

        {/* X labels */}
        {labelIdx.map((i) => (
          <text
            key={i}
            x={geo.coords[i].cx}
            y={H - 10}
            textAnchor="middle"
            fontSize="17"
            fill="#a3a3a3"
            fontWeight="700"
          >
            {formatDateEnShort(geo.coords[i].date)}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {active && (
        <div className="anim-pop pointer-events-none absolute inset-x-0 top-0 mx-auto w-fit rounded-xl border px-4 py-2 text-center shadow-lg backdrop-blur" style={{ borderColor: "var(--color-card-border)", background: "var(--color-card)" }}>
          <span className="tabular text-base font-black" style={{ color: "var(--color-text)" }}>
            {formatWeight(active.weight)} kg
          </span>
          <span className="mx-1.5" style={{ color: "var(--color-text-faint)" }}>·</span>
          <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>{active.reps} reps</span>
          <span className="mx-1.5" style={{ color: "var(--color-text-faint)" }}>·</span>
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-faint)" }}>
            {formatDateEnShort(active.date)}
          </span>
        </div>
      )}
    </div>
  );
}
