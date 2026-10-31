// Tipos de red social que el sitio sabe dibujar (ver components/common/SocialIcon.jsx).
// El valor es el `tipo` que guarda la API, siempre en minúsculas.
export const TIPOS_RED = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
];

export const MAX_REDES = 10; // mismo tope que el back

// Las filas del formulario llevan un `uid` propio para usarlo como key y para
// asociar errores, porque el orden y el tipo cambian mientras se edita.
let contador = 0;
export const nuevaFila = (tipo = "", url = "") => ({ uid: `red-${++contador}`, tipo, url });

export const filasDesdeApi = (redes) => (redes ?? []).map((r) => nuevaFila(r.tipo, r.url));

// Lo que se manda a PUT /comercio.
export const redesParaApi = (filas) =>
  filas.map(({ tipo, url }) => ({ tipo: String(tipo).trim().toLowerCase(), url: String(url).trim() }));
