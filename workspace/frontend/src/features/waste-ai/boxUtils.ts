export interface CssBox {
  left: string; // CSS percentage, e.g. "23.4%"
  top: string;
  width: string;
  height: string;
}

/**
 * Gemini returns box_2d as [ymin, xmin, ymax, xmax], normalized 0-1000.
 * This is NOT [x, y, x, y] — mixing up the order rotates/misplaces every
 * box without throwing an error, so this conversion is the one place
 * that ordering has to be gotten right.
 */
export function box2dToCss(
  box_2d: [number, number, number, number]
): CssBox {
  const [rawYmin, rawXmin, rawYmax, rawXmax] = box_2d;
  const ymin = Math.max(0, Math.min(1000, Math.min(rawYmin, rawYmax)));
  const ymax = Math.max(0, Math.min(1000, Math.max(rawYmin, rawYmax)));
  const xmin = Math.max(0, Math.min(1000, Math.min(rawXmin, rawXmax)));
  const xmax = Math.max(0, Math.min(1000, Math.max(rawXmin, rawXmax)));
  return {
    left: `${xmin / 10}%`,
    top: `${ymin / 10}%`,
    width: `${Math.max(1, (xmax - xmin) / 10)}%`,
    height: `${Math.max(1, (ymax - ymin) / 10)}%`,
  };
}

export function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    Plastic: "#3b82f6",
    Metal: "#6b7280",
    Glass: "#06b6d4",
    Paper: "#a16207",
    Electronic: "#8b5cf6",
    Hazardous: "#dc2626",
    Organic: "#16a34a",
    Other: "#737373",
  };
  return colors[category] ?? colors.Other;
}
