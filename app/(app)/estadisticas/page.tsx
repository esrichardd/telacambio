import { Suspense } from "react";
import type { Metadata } from "next";
import EstadisticasData from "@/components/estadisticas/EstadisticasData";
import EstadisticasView from "@/components/estadisticas/EstadisticasView";

export const metadata: Metadata = {
  title: "Estadísticas",
};

// getCurrentProfile is called inside EstadisticasData — no need to call it here
// because there is no content outside the Suspense boundary that needs user data.
// The skeleton renders instantly while EstadisticasData resolves the RPC.
export default function EstadisticasPage() {
  return (
    <Suspense fallback={<EstadisticasView skeleton />}>
      <EstadisticasData />
    </Suspense>
  );
}
