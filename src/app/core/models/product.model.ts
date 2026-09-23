export interface Product {
    id: string;
    nombre: string;
    slug?: string;
    descripcion: string;
    precio: number;
    imagen?: string; // Imagen principal
    imagenes?: string[]; // Lista de hasta 3 imágenes
    rubroId?: string;
    categoriaId?: string;
    subcategoriaId?: string;
    destacado?: boolean;
    descuento?: number;
    disponibilidad: boolean;
    publicado: boolean;
    /** Variantes de color disponibles (ej: iPhones). Si no está, no se muestran pickers. */
    colores?: { nombre: string; hex: string }[];
    /** Capacidades de almacenamiento disponibles (ej: 128GB, 256GB). Si no está, no se muestran pickers. */
    capacidades?: string[];
    /**
     * Specs técnicas del comparador (ej: iPhones). Solo aplica a productos con
     * `subcategoriaId` que empieza con `iphone-`. Si no está, no se muestran en
     * el comparador. La lista de campos coincide con las columnas del comparador.
     */
    specs?: ProductSpecs;
}

/** Specs técnicas que se muestran en el comparador de iPhones. */
export interface ProductSpecs {
    chip: string;
    pantalla: string;
    camara: string;
    /** Horas de reproducción de video (string con unidad, ej: "22 hs"). */
    bateria: string;
    conector: string;
    /** Capacidad mínima de almacenamiento disponible (ej: "128 GB"). */
    capacidadMin: string;
}
