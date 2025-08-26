type Decoded = {
  size: number;
  thickness: number;
  gap: number;
  outline: number;
  drawOutline: boolean;
  colorType: number;
  color: { r: number; g: number; b: number };
  alphaEnabled: boolean;
  alpha: number;
  tStyle: boolean;
  dot: boolean;
};

/**
 * Generate CS/CS2 compatible crosshair cvars.
 * Many players use the same set across CS:GO and CS2.
 */
export function makeCfgFromDecoded(d: Decoded) {
  const lines: string[] = [];

  // Base cvars
  lines.push(`cl_crosshairsize "${round(d.size, 3)}"`);
  lines.push(`cl_crosshairthickness "${round(d.thickness, 3)}"`);
  lines.push(`cl_crosshairgap "${round(d.gap, 3)}"`);
  lines.push(`cl_crosshair_drawoutline "${d.drawOutline ? 1 : 0}"`);
  lines.push(`cl_crosshair_outlinethickness "${round(d.outline, 3)}"`);
  lines.push(`cl_crosshairdot "${d.dot ? 1 : 0}"`);
  lines.push(`cl_crosshair_t "${d.tStyle ? 1 : 0}"`);

  // Alpha
  lines.push(`cl_crosshairusealpha "${d.alphaEnabled ? 1 : 0}"`);
  lines.push(`cl_crosshairalpha "${Math.round(d.alpha)}"`);

  // Color
  const colorType = clamp(d.colorType, 0, 5);
  lines.push(`cl_crosshaircolor "${colorType}"`);
  if (colorType === 5) {
    lines.push(`cl_crosshaircolor_r "${clamp(Math.round(d.color.r), 0, 255)}"`);
    lines.push(`cl_crosshaircolor_g "${clamp(Math.round(d.color.g), 0, 255)}"`);
    lines.push(`cl_crosshaircolor_b "${clamp(Math.round(d.color.b), 0, 255)}"`);
  }

  // Defaults for stability (non-essential but useful)
  lines.push(`cl_crosshairgap_useweaponvalue "0"`);

  // Final line: echo for clarity
  lines.push(`echo "Crosshair loaded"`);

  return lines.join("\n") + "\n";
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function round(n: number, p: number) {
  const m = Math.pow(10, p);
  return Math.round(n * m) / m;
}
