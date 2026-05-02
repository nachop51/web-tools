/// <reference types="@solidjs/start/env" />

declare module "culori" {
  export type Color = {
    mode: string;
    alpha?: number;
    r?: number;
    g?: number;
    b?: number;
    h?: number;
    s?: number;
    l?: number;
    v?: number;
    c?: number;
    [key: string]: number | string | undefined;
  };
  export function parse(input: string): Color | undefined;
  export function formatHex(color: Color | string | undefined): string | undefined;
  export function formatCss(color: Color | string | undefined): string | undefined;
  export function converter(
    mode: string,
  ): (color: Color | string | undefined) => Color | undefined;
  export function clampGamut(mode: string): (color: Color | undefined) => Color;
  export function clampRgb(color: Color | undefined): Color;
  export function toGamut(mode: string, ...args: unknown[]): (color: Color | undefined) => Color;
  export function inGamut(mode: string): (color: Color | undefined) => boolean;
  export function interpolate(
    colors: (Color | string)[],
    mode?: string,
    overrides?: Record<string, unknown>,
  ): (t: number) => Color;
  export function samples(n?: number, gamma?: number): number[];
  export function round(places?: number): (n: number) => number;
  export function wcagLuminance(color: Color | string | undefined): number | undefined;
  export function wcagContrast(
    a: Color | string | undefined,
    b: Color | string | undefined,
  ): number;
  export function filterDeficiencyProt(severity?: number): (color: Color | undefined) => Color;
  export function filterDeficiencyDeuter(severity?: number): (color: Color | undefined) => Color;
  export function filterDeficiencyTrit(severity?: number): (color: Color | undefined) => Color;
  export function filterGrayscale(severity?: number): (color: Color | undefined) => Color;
  export const colorsNamed: Record<string, number>;
}

declare module "apca-w3" {
  export function calcAPCA(text: string | number, bg: string | number): number | string;
  export function sRGBtoY(rgb: number[]): number;
  export function displayP3toY(rgb: number[]): number;
  export function adobeRGBtoY(rgb: number[]): number;
  export function alphaBlend(rgbaFG: number[], rgbBG: number[]): number[];
  export function calcAPCAcustom(
    text: number[],
    bg: number[],
    config?: Record<string, unknown>,
  ): number;
}
