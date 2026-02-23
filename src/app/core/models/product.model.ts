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
}
