"use client";

/**
 * Ícone de prioridade no estilo "signal bars":
 * 1 = Baixa (1 barra), 2 = Média (2 barras), 3 = Alta (3 barras).
 * Barras mais grossas e nítidas. Cores via className (ex.: text-neutral-400).
 */
export function PriorityIcon({
  priority,
  size = 12,
  className = "",
}: {
  priority: number;
  size?: number;
  className?: string;
}) {
  const viewW = 16;
  const viewH = 14;
  const barWidth = 3;
  const gap = 1;
  const bars = [
    { x: 2, h: 4 },
    { x: 2 + barWidth + gap, h: 7 },
    { x: 2 + (barWidth + gap) * 2, h: 10 },
  ];
  const visible = priority;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewW} ${viewH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      shapeRendering="crispEdges"
      aria-label={priority === 1 ? "Prioridade baixa" : priority === 2 ? "Prioridade média" : "Prioridade alta"}
    >
      {bars.slice(0, visible).map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={viewH - bar.h}
          width={barWidth}
          height={bar.h}
          rx={1.5}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
