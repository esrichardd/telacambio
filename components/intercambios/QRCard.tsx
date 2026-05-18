"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import QRScannerModal from "./QRScannerModal";

const BASE_URL = "telacambio.co";

interface QRCardProps {
  username: string;
}

export default function QRCard({ username }: QRCardProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const profileUrl = `https://${BASE_URL}/${username}`;

  function handleDownload() {
    const svg = qrContainerRef.current?.querySelector("svg");
    if (!svg) return;

    const padding = 48;
    const qrSize = 512;
    const totalSize = qrSize + padding * 2;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = totalSize;
      canvas.height = totalSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, totalSize, totalSize);
      ctx.drawImage(img, padding, padding, qrSize, qrSize);
      URL.revokeObjectURL(svgUrl);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const dlUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = dlUrl;
        a.download = `telacambio-${username}.png`;
        a.click();
        URL.revokeObjectURL(dlUrl);
      }, "image/png");
    };
    img.src = svgUrl;
  }

  return (
    <>
      <div className="mx-4 rounded-2xl bg-surface border border-border p-5">
        {/* Section label */}
        <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-4">
          Mi QR
        </p>

        {/* QR code */}
        <div className="flex justify-center mb-3">
          <div
            ref={qrContainerRef}
            className="w-44 h-44 bg-[#f5f5f5] rounded-xl flex items-center justify-center p-3"
          >
            <QRCodeSVG
              value={profileUrl}
              size={152}
              bgColor="#f5f5f5"
              fgColor="#1d9e75"
              level="M"
            />
          </div>
        </div>

        {/* URL label */}
        <p className="text-center text-xs text-muted mb-4">
          {BASE_URL}/<span className="text-brand font-medium">{username}</span>
        </p>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-surface-subtle border border-border text-muted text-sm rounded-xl px-4 py-2.5 hover:text-foreground transition-colors"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar QR
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">o</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Scan trigger */}
        <button
          onClick={() => setScannerOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-brand/8 border border-brand/20 text-brand text-sm font-medium rounded-xl px-4 py-3 hover:bg-brand/15 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7V5a2 2 0 012-2h2" />
            <path d="M17 3h2a2 2 0 012 2v2" />
            <path d="M21 17v2a2 2 0 01-2 2h-2" />
            <path d="M7 21H5a2 2 0 01-2-2v-2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
          Escanear QR de otro coleccionista
        </button>
      </div>

      {scannerOpen && <QRScannerModal onClose={() => setScannerOpen(false)} />}
    </>
  );
}
