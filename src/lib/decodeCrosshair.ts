import { decodeCrosshairCode } from "csgo-sharecode";

/**
 * Wrap akiver/csgo-sharecode decoding.
 * Returns a normalized structure the rest of the app expects.
 */
export async function decodeCrosshair(shareCode: string) {
  // The library throws on invalid codes.
  const raw = decodeCrosshairCode(shareCode);

  // raw likely contains fields like:
  // {
  //   size, thickness, gap, outline, drawOutline,
  //   colorType, r, g, b, alpha, alphaEnabled, tStyle, dot, ...
  // }
  // Normalize to our shape with safe defaults.
  const decoded = {
    size: clampNum(raw.size ?? 2, 0, 10),
    thickness: clampNum(raw.thickness ?? 0.5, 0, 5),
    gap: clampNum(raw.gap ?? 0, -10, 10),
    outline: clampNum(raw.outline ?? 1, 0, 3),
    drawOutline: Boolean(raw.drawOutline ?? true),
    colorType: clampNum(raw.colorType ?? 0, 0, 5),
    color: {
      r: clampNum(raw.r ?? 0, 0, 255),
      g: clampNum(raw.g ?? 255, 0, 255),
      b: clampNum(raw.b ?? 0, 0, 255)
    },
    alphaEnabled: Boolean(raw.alphaEnabled ?? true),
    alpha: clampNum(raw.alpha ?? 255, 0, 255),
    tStyle: Boolean(raw.tStyle ?? false),
    dot: Boolean(raw.dot ?? false),

    // The returning object may include additional attributes in raw;
    // we keep only what's needed for preview + cfg generation.
  };

  return decoded;
}

function clampNum(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number(n)));
}
