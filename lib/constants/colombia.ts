/**
 * Departamentos y ciudades de Colombia.
 * Ordenados alfabéticamente. Ciudades ordenadas por relevancia (capital primero).
 * Ampliar con más ciudades según crezca la comunidad.
 */

export type Departamento = {
  code: string; // Código DANE del departamento
  name: string;
  ciudades: string[];
};

export const COLOMBIA_DEPARTAMENTOS: Departamento[] = [
  {
    code: "91",
    name: "Amazonas",
    ciudades: ["Leticia", "Puerto Nariño"],
  },
  {
    code: "05",
    name: "Antioquia",
    ciudades: [
      "Medellín",
      "Bello",
      "Itagüí",
      "Envigado",
      "Apartadó",
      "Turbo",
      "Rionegro",
      "Sabaneta",
      "La Estrella",
      "Copacabana",
      "Caucasia",
      "Marinilla",
      "El Bagre",
      "Yarumal",
      "Andes",
    ],
  },
  {
    code: "81",
    name: "Arauca",
    ciudades: ["Arauca", "Saravena", "Tame", "Arauquita", "Fortul"],
  },
  {
    code: "08",
    name: "Atlántico",
    ciudades: [
      "Barranquilla",
      "Soledad",
      "Malambo",
      "Sabanalarga",
      "Galapa",
      "Baranoa",
      "Puerto Colombia",
    ],
  },
  {
    code: "11",
    name: "Bogotá D.C.",
    ciudades: ["Bogotá"],
  },
  {
    code: "13",
    name: "Bolívar",
    ciudades: [
      "Cartagena",
      "Magangué",
      "Turbaco",
      "El Carmen de Bolívar",
      "Mompox",
      "Arjona",
      "San Juan Nepomuceno",
    ],
  },
  {
    code: "15",
    name: "Boyacá",
    ciudades: [
      "Tunja",
      "Duitama",
      "Sogamoso",
      "Chiquinquirá",
      "Paipa",
      "Puerto Boyacá",
      "Nobsa",
      "Villa de Leyva",
    ],
  },
  {
    code: "17",
    name: "Caldas",
    ciudades: [
      "Manizales",
      "Villamaría",
      "La Dorada",
      "Chinchiná",
      "Riosucio",
      "Salamina",
      "Anserma",
    ],
  },
  {
    code: "18",
    name: "Caquetá",
    ciudades: [
      "Florencia",
      "San Vicente del Caguán",
      "Puerto Rico",
      "El Paujil",
      "Belén de los Andaquíes",
    ],
  },
  {
    code: "85",
    name: "Casanare",
    ciudades: [
      "Yopal",
      "Aguazul",
      "Villanueva",
      "Paz de Ariporo",
      "Tauramena",
      "Trinidad",
    ],
  },
  {
    code: "19",
    name: "Cauca",
    ciudades: [
      "Popayán",
      "Santander de Quilichao",
      "Puerto Tejada",
      "Patía",
      "Miranda",
      "Guapi",
    ],
  },
  {
    code: "20",
    name: "Cesar",
    ciudades: [
      "Valledupar",
      "Aguachica",
      "Bosconia",
      "Codazzi",
      "La Jagua de Ibirico",
      "Curumaní",
    ],
  },
  {
    code: "27",
    name: "Chocó",
    ciudades: [
      "Quibdó",
      "Istmina",
      "Tadó",
      "Condoto",
      "Riosucio",
      "Bahía Solano",
      "Nuquí",
    ],
  },
  {
    code: "23",
    name: "Córdoba",
    ciudades: [
      "Montería",
      "Lorica",
      "Sahagún",
      "Cereté",
      "Montelíbano",
      "Tierralta",
      "Planeta Rica",
    ],
  },
  {
    code: "25",
    name: "Cundinamarca",
    ciudades: [
      "Soacha",
      "Facatativá",
      "Zipaquirá",
      "Chía",
      "Fusagasugá",
      "Madrid",
      "Mosquera",
      "Cajicá",
      "Girardot",
      "Funza",
      "Tocancipá",
      "La Mesa",
      "Cota",
      "Sopó",
      "Tenjo",
    ],
  },
  {
    code: "94",
    name: "Guainía",
    ciudades: ["Inírida"],
  },
  {
    code: "95",
    name: "Guaviare",
    ciudades: ["San José del Guaviare", "El Retorno", "Calamar"],
  },
  {
    code: "41",
    name: "Huila",
    ciudades: [
      "Neiva",
      "Pitalito",
      "Garzón",
      "La Plata",
      "Campoalegre",
      "Rivera",
    ],
  },
  {
    code: "44",
    name: "La Guajira",
    ciudades: [
      "Riohacha",
      "Maicao",
      "Uribia",
      "Manaure",
      "San Juan del Cesar",
      "Fonseca",
    ],
  },
  {
    code: "47",
    name: "Magdalena",
    ciudades: [
      "Santa Marta",
      "Ciénaga",
      "Fundación",
      "El Banco",
      "Plato",
      "Aracataca",
    ],
  },
  {
    code: "50",
    name: "Meta",
    ciudades: [
      "Villavicencio",
      "Acacías",
      "Granada",
      "Puerto López",
      "San Martín",
      "Cumaral",
      "Puerto Gaitán",
    ],
  },
  {
    code: "52",
    name: "Nariño",
    ciudades: [
      "Pasto",
      "Tumaco",
      "Ipiales",
      "Túquerres",
      "La Unión",
      "Samaniego",
    ],
  },
  {
    code: "54",
    name: "Norte de Santander",
    ciudades: [
      "Cúcuta",
      "Los Patios",
      "Villa del Rosario",
      "Ocaña",
      "Tibú",
      "Pamplona",
      "El Zulia",
    ],
  },
  {
    code: "86",
    name: "Putumayo",
    ciudades: [
      "Mocoa",
      "Puerto Asís",
      "Orito",
      "La Hormiga",
      "Valle del Guamuez",
    ],
  },
  {
    code: "63",
    name: "Quindío",
    ciudades: [
      "Armenia",
      "Calarcá",
      "Montenegro",
      "La Tebaida",
      "Quimbaya",
      "Circasia",
    ],
  },
  {
    code: "66",
    name: "Risaralda",
    ciudades: [
      "Pereira",
      "Dosquebradas",
      "Santa Rosa de Cabal",
      "La Virginia",
      "Belén de Umbría",
      "Marsella",
    ],
  },
  {
    code: "88",
    name: "San Andrés y Providencia",
    ciudades: ["San Andrés", "Providencia"],
  },
  {
    code: "68",
    name: "Santander",
    ciudades: [
      "Bucaramanga",
      "Floridablanca",
      "Girón",
      "Piedecuesta",
      "Barrancabermeja",
      "Socorro",
      "San Gil",
      "Málaga",
    ],
  },
  {
    code: "70",
    name: "Sucre",
    ciudades: [
      "Sincelejo",
      "Corozal",
      "Sampués",
      "San Marcos",
      "Tolú",
      "Morroa",
    ],
  },
  {
    code: "73",
    name: "Tolima",
    ciudades: [
      "Ibagué",
      "Espinal",
      "Melgar",
      "Honda",
      "Líbano",
      "Chaparral",
      "Mariquita",
    ],
  },
  {
    code: "76",
    name: "Valle del Cauca",
    ciudades: [
      "Cali",
      "Buenaventura",
      "Palmira",
      "Buga",
      "Tuluá",
      "Cartago",
      "Yumbo",
      "Jamundí",
      "Candelaria",
      "Zarzal",
      "Roldanillo",
    ],
  },
  {
    code: "97",
    name: "Vaupés",
    ciudades: ["Mitú"],
  },
  {
    code: "99",
    name: "Vichada",
    ciudades: ["Puerto Carreño", "La Primavera"],
  },
];

/** Lookup rápido por código de departamento */
export const DEPARTAMENTO_BY_CODE = Object.fromEntries(
  COLOMBIA_DEPARTAMENTOS.map((d) => [d.code, d]),
);

/** Lookup rápido por nombre de departamento */
export const DEPARTAMENTO_BY_NAME = Object.fromEntries(
  COLOMBIA_DEPARTAMENTOS.map((d) => [d.name, d]),
);

/** Retorna las ciudades de un departamento dado su nombre */
export function getCiudadesByDepartamento(departamentoName: string): string[] {
  return DEPARTAMENTO_BY_NAME[departamentoName]?.ciudades ?? [];
}
