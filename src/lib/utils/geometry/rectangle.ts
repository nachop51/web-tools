export interface RectangleProperties {
  area: number;
  perimeter: number;
  diagonal: number;
  isSquare: boolean;
}

export function rectangle(width: number, height: number): RectangleProperties {
  return {
    area: width * height,
    perimeter: 2 * (width + height),
    diagonal: Math.sqrt(width * width + height * height),
    isSquare: width === height,
  };
}
