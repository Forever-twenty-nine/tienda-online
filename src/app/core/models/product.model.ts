export interface Product {
    id: string;
    nombre: string;
    slug?: string;
    descripcion: string;
    precio: number;
    imagen?: string;
    categoriaId?: string;
    destacado?: boolean;
    disponibilidad: boolean;
    publicado: boolean;
}
