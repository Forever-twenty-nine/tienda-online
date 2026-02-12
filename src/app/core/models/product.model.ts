export interface Product {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen?: string;
    categoriaId?: string;
    destacado?: boolean;
}
