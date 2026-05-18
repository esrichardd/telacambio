"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Matches https://telacambio.co/username or http://www.telacambio.co/username
const TELACAMBIO_PATTERN =
  /^https?:\/\/(www\.)?telacambio\.co\/([a-zA-Z0-9_]+)\/?$/;

const READER_ID = "tlc-qr-reader";

interface QRScannerModalProps {
  onClose: () => void;
}

export default function QRScannerModal({ onClose }: QRScannerModalProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  // Ref to the stop function so cleanup can call it without stale closures
  const stopFnRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        // Dynamic import keeps html5-qrcode out of the SSR bundle
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode(READER_ID);
        stopFnRef.current = () => scanner.stop();

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (!isMounted) return;
            const match = decodedText.match(TELACAMBIO_PATTERN);
            if (match) {
              const username = match[2];
              setScanning(false);
              scanner
                .stop()
                .catch(() => {})
                .finally(() => {
                  if (isMounted) {
                    onClose();
                    router.push(`/${username}`);
                  }
                });
            }
          },
          () => {
            // Continuous scan attempt errors — normal, ignore
          },
        );
      } catch {
        if (isMounted) {
          setError(
            "No se pudo acceder a la cámara. Verifica los permisos e intenta de nuevo.",
          );
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      stopFnRef.current?.().catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-foreground font-medium text-base">Escanear QR</h2>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-foreground hover:bg-white/20 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Scanner / Error area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {error ? (
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted"
              >
                <path d="M3 7V5a2 2 0 012-2h2" />
                <path d="M17 3h2a2 2 0 012 2v2" />
                <path d="M21 17v2a2 2 0 01-2 2h-2" />
                <path d="M7 21H5a2 2 0 01-2-2v-2" />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-2">
              Sin acceso a la cámara
            </p>
            <p className="text-sm text-muted leading-relaxed">{error}</p>
          </div>
        ) : (
          <>
            {/* html5-qrcode mounts the video stream inside this div */}
            <div
              id={READER_ID}
              className="w-full max-w-sm overflow-hidden rounded-2xl"
            />
            {!scanning && (
              <p className="text-brand text-sm font-medium">
                ¡QR reconocido! Redirigiendo...
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer hint */}
      {!error && scanning && (
        <p className="text-center text-sm text-muted pb-10 px-6">
          Apunta al QR de otro coleccionista de TeLaCambio
        </p>
      )}
    </div>
  );
}
