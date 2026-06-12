import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Las 8 islas (incluida La Graciosa como octava oficial).
export const ISLAS = [
  'Tenerife',
  'Gran Canaria',
  'Lanzarote',
  'Fuerteventura',
  'La Palma',
  'La Gomera',
  'El Hierro',
  'La Graciosa',
] as const;

// Tipos de espacio que intermediamos.
export const TIPOS = [
  'oficina',
  'despacho',
  'sala-reuniones',
  'coworking',
  'local-comercial',
  'nave',
  'espacio-eventos',
  'otro',
] as const;

// Etiquetas legibles para los tipos (para mostrar en la UI).
export const TIPO_LABEL: Record<(typeof TIPOS)[number], string> = {
  'oficina': 'Oficina',
  'despacho': 'Despacho',
  'sala-reuniones': 'Sala de reuniones',
  'coworking': 'Puesto de coworking',
  'local-comercial': 'Local comercial',
  'nave': 'Nave',
  'espacio-eventos': 'Espacio para eventos',
  'otro': 'Otro',
};

// Etiquetas en inglés (catálogo EN).
export const TIPO_LABEL_EN: Record<(typeof TIPOS)[number], string> = {
  'oficina': 'Office',
  'despacho': 'Private office',
  'sala-reuniones': 'Meeting room',
  'coworking': 'Coworking desk',
  'local-comercial': 'Retail space',
  'nave': 'Warehouse',
  'espacio-eventos': 'Event space',
  'otro': 'Other',
};

// Colección "espacios": un .md por espacio bajo src/content/espacios/.
const espacios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/espacios' }),
  schema: z.object({
    // --- Identidad ---
    title: z.string(),
    description: z.string(), // 1-2 frases: card + meta description

    // --- Ubicación ---
    isla: z.enum(ISLAS),
    municipio: z.string(),
    zona: z.string().optional(), // barrio / polígono

    // --- Clasificación ---
    tipo: z.enum(TIPOS),

    // --- Datos del espacio ---
    capacidad: z.number().int().positive().optional(), // nº de personas
    superficie: z.number().positive().optional(),       // m²

    // --- Precio orientativo ---
    precio: z.number().positive().optional(),
    precioPeriodo: z.enum(['mes', 'dia', 'hora']).default('mes'),
    precioDesde: z.boolean().default(true), // "desde X€"

    // --- Media ---
    imagenPrincipal: z.string().optional(), // ruta en /public o /src/assets
    imagenes: z.array(z.string()).default([]),
    imagenAlt: z.string().optional(),

    // --- Características (chips): wifi, parking, aire acondicionado... ---
    caracteristicas: z.array(z.string()).default([]),

    // --- Flags ---
    destacado: z.boolean().default(false),  // aparece en la home
    disponible: z.boolean().default(true),
    draft: z.boolean().default(false),       // no se publica si true
    orden: z.number().default(0),            // para ordenar el catálogo
  }),
});

export const collections = { espacios };
