"use client";

/**
 * ProgressCircle — ícone SVG de progresso tipo "pizza/setor".
 * Preenche o interior de um círculo outline no estido RiProgressLine.
 *
 * Props:
 *  pct   — 0..100
 *  size  — tamanho em px (default 40)
 *  color — cor do preenchimento (default usa a cor primária via currentColor)
 */
export function ProgressCircle({
  pct,
  size = 40,
  color,
}: {
  pct: number;
  size?: number;
  color?: string;
}) {
  const clamp = Math.min(100, Math.max(0, pct));
  const cx = 12;
  const cy = 12;
  const r  = 9.5;

  /* cor dinâmica conforme o progresso */
  const fill =
    color ??
    (clamp === 100
      ? "#10b981"  /* emerald */
      : clamp >= 60
      ? "#3b82f6"  /* blue    */
      : clamp >= 30
      ? "#f97316"  /* orange  */
      : "#6b7280" /* grey    */);

  /* ângulo em radianos — começa no topo (−90°) e vai em sentido horário */
  const angle     = ((clamp / 100) * 360 - 90) * (Math.PI / 180);
  const endX      = cx + r * Math.cos(angle);
  const endY      = cy + r * Math.sin(angle);
  const largeArc  = clamp > 50 ? 1 : 0;

  const sectorPath =
    clamp <= 0
      ? ""
      : clamp >= 100
      ? /* círculo completo */ `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
      : `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${clamp}% concluído`}
    >
      {/* círculo outline (fundo) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
        opacity={0.25}
      />

      {/* setor preenchido */}
      {sectorPath && (
        <path
          d={sectorPath}
          fill={fill}
          style={{ transition: "d 0.4s ease" }}
        />
      )}

      {/* círculo outline por cima (borda nítida) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
      />
    </svg>
  );
}
