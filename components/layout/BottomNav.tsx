"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/album",
    label: "Álbum",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1"
          fill={active ? "currentColor" : "none"}
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1"
          fill={active ? "currentColor" : "none"}
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1"
          fill={active ? "currentColor" : "none"}
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1"
          fill={active ? "currentColor" : "none"}
        />
      </svg>
    ),
  },
  {
    href: "/estadisticas",
    label: "Estadísticas",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/intercambios",
    label: "Intercambios",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M7 16V4m0 0L3 8m4-4l4 4"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.8}
        />
        <path
          d="M17 8v12m0 0l4-4m-4 4l-4-4"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.8}
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Perfil",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="7" r="4" fill={active ? "currentColor" : "none"} />
        <path d="M4 21v-1a8 8 0 0116 0v1" />
      </svg>
    ),
  },
];

interface BottomNavProps {
  pendingTradesCount?: number;
}

export default function BottomNav({ pendingTradesCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="shrink-0 bg-surface/95 backdrop-blur border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="max-w-2xl mx-auto flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const isIntercambios = item.href === "/intercambios";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                active ? "text-brand" : "text-muted hover:text-foreground"
              }`}
            >
              <span className="relative">
                {item.icon(active)}
                {isIntercambios && pendingTradesCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5 leading-none">
                    {pendingTradesCount > 9 ? "9+" : pendingTradesCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium leading-none ${active ? "text-brand" : "text-muted"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
