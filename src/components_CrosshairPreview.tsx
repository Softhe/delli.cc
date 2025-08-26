import React, { useEffect, useRef } from "react";

// Decoded structure should include basic properties for crosshair:
type DecodedCrosshair = {
  size: number; // cl_crosshairsize
  thickness: number; // cl_crosshairthickness
  gap: number; // cl_crosshairgap
  outline: number; // cl_crosshair_outlinethickness
  drawOutline: boolean; // cl_crosshair_drawoutline
  colorType: number; // cl_crosshaircolor (0-4 or 5 custom)
  color: { r: number; g: number; b: number };
  alphaEnabled: boolean; // cl_crosshairusealpha
  alpha: number; // cl_crosshairalpha (0-255)
  tStyle: boolean; // cl_crosshair_t
  dot: boolean; // cl_crosshairdot
};

export const CrosshairPreview: React.FC<{ decoded: DecodedCrosshair | null }> = ({
  decoded
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = window.devicePixelRatio || 1;
    const W = 220;
    const H = 220;
    canvas.width = W * s;
    canvas.height = H * s;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(s, 0, 0, s, 0, 0);

    // background
    ctx.fillStyle = "#0f1115";
    ctx.fillRect(0, 0, W, H);

    // center
    const cx = W / 2;
    const cy = H / 2;

    // grid for reference
    ctx.strokeStyle = "#1b1f28";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, H);
    ctx.moveTo(0, cy);
    ctx.lineTo(W, cy);
    ctx.stroke();

    if (!decoded) return;

    const {
      size,
      thickness,
      gap,
      outline,
      drawOutline,
      colorType,
      color,
      alphaEnabled,
      alpha,
      tStyle,
      dot
    } = decoded;

    // Determine color
    const presetColors: Record<number, [number, number, number]> = {
      0: [50, 250, 50], // green
      1: [250, 50, 50], // red
      2: [250, 250, 50], // yellow
      3: [50, 50, 250], // blue
      4: [50, 250, 250] // cyan
    };
    const [r, g, b] =
      colorType === 5 ? [color.r, color.g, color.b] : (presetColors[colorType] || [50, 250, 50]);
    const a = alphaEnabled ? Math.max(0, Math.min(255, alpha)) / 255 : 1;
    const stroke = `rgba(${r},${g},${b},${a})`;
    const outlineColor = `rgba(0,0,0,${Math.min(1, a)})`;

    const drawBar = (x1: number, y1: number, x2: number, y2: number) => {
      if (drawOutline && outline > 0) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = thickness + outline * 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    // Convert game units to pixels (simple scale)
    const scale = 4; // visual scale factor
    const gpx = gap * scale;
    const spx = size * scale;

    // Up
    if (!tStyle) {
      drawBar(cx, cy - gpx - spx, cx, cy - gpx);
    }
    // Down
    drawBar(cx, cy + gpx, cx, cy + gpx + spx);
    // Left
    drawBar(cx - gpx - spx, cy, cx - gpx, cy);
    // Right
    drawBar(cx + gpx, cy, cx + gpx + spx, cy);

    // Dot
    if (dot) {
      const rad = Math.max(1, thickness / 2);
      if (drawOutline && outline > 0) {
        ctx.fillStyle = outlineColor;
        ctx.beginPath();
        ctx.arc(cx, cy, rad + outline, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = stroke;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [decoded]);

  return <canvas ref={canvasRef} className="canvas" />;
};
