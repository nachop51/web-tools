import QRCode from "qrcode";

export type QrOpts = { size: number; ecl: "L" | "M" | "Q" | "H" };

export async function generateQrDataUrl(text: string, opts: QrOpts): Promise<string> {
  return QRCode.toDataURL(text, {
    width: opts.size,
    errorCorrectionLevel: opts.ecl,
  });
}
