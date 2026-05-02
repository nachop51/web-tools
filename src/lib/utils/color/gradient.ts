import { parse, interpolate, samples, formatHex } from "culori";

export type GradientSpace = "oklch" | "hsl" | "srgb";
export type GradientType = "linear" | "radial" | "conic";

export function generateGradientResult(
  stops: string[],
  space: GradientSpace,
  type: GradientType,
  angle: number,
): { css: string; previewCss: string } {
  if (stops.length < 2) return { css: "", previewCss: "" };

  const parsed = stops.map((s) => parse(s)).filter(Boolean);
  if (parsed.length < 2) return { css: "", previewCss: "" };

  const spaceName = space === "srgb" ? "srgb" : space;
  const stopList = stops.join(", ");

  let css: string;
  if (type === "linear") {
    css = `background: linear-gradient(${angle}deg in ${spaceName}, ${stopList});`;
  } else if (type === "radial") {
    css = `background: radial-gradient(circle in ${spaceName}, ${stopList});`;
  } else {
    css = `background: conic-gradient(from ${angle}deg in ${spaceName}, ${stopList});`;
  }

  const interpolated = interpolate(parsed as never, space);
  const sampled = samples(7).map((t) => formatHex(interpolated(t))!);
  const previewStops = sampled.join(", ");

  let previewCss: string;
  if (type === "linear") {
    previewCss = `linear-gradient(${angle}deg, ${previewStops})`;
  } else if (type === "radial") {
    previewCss = `radial-gradient(circle, ${previewStops})`;
  } else {
    previewCss = `conic-gradient(from ${angle}deg, ${previewStops})`;
  }

  return { css, previewCss };
}
