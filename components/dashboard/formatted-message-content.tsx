"use client";

import { cn } from "@/lib/utils";

function parseTableRow(line: string): string[] {
  return line.split("|").map((s) => s.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
}

function isMarkdownTable(lines: string[]): boolean {
  if (lines.length < 2) return false;
  return lines.every((l) => l.includes("|"));
}

export function FormattedMessageContent({
  content,
  className,
  tableClassName,
}: {
  content: string;
  className?: string;
  tableClassName?: string;
}) {
  const normalized = (content ?? "").replace(/\\n/g, "\n");
  const lines = normalized.split(/\r?\n/).map((l) => l.trimEnd());
  const parts: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const tableLines: string[] = [];
    while (i < lines.length && lines[i].includes("|")) {
      tableLines.push(lines[i]);
      i++;
    }
    if (tableLines.length >= 2 && isMarkdownTable(tableLines)) {
      const headerCells = parseTableRow(tableLines[0]);
      const secondRowCells = parseTableRow(tableLines[1]);
      const isSeparator = secondRowCells.length > 0 && secondRowCells.every((c) => /^[-:\s]+$/.test(c));
      const dataStart = isSeparator ? 2 : 1;
      const dataRows = tableLines.slice(dataStart).map(parseTableRow).filter((row) => row.some((c) => c));
      parts.push(
        <table
          key={parts.length}
          className={cn("w-full my-2 text-left border-collapse rounded overflow-hidden text-sm", tableClassName)}
        >
          <thead>
            <tr className="border-b border-border">
              {headerCells.map((cell, j) => (
                <th key={j} className="px-2 py-1.5 font-semibold">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className="border-b border-border/60 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-2 py-1.5">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (tableLines.length > 0) {
      parts.push(tableLines.join("\n"));
      parts.push(<br key={parts.length} />);
    }
    const normalLines: string[] = [];
    while (i < lines.length && !lines[i].includes("|")) {
      normalLines.push(lines[i]);
      i++;
    }
    if (normalLines.length > 0) {
      normalLines.forEach((line, idx) => {
        parts.push(<span key={`t-${parts.length}-${idx}`}>{line}</span>);
        if (idx < normalLines.length - 1) parts.push(<br key={`br-${parts.length}-${idx}`} />);
      });
    }
  }

  return <div className={cn("space-y-1", className)}>{parts}</div>;
}
