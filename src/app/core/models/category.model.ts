export interface Rubro {
    id: string;
    nombre: string;
    orden: number;
}

export interface Category {
    id: string;
    nombre: string;
    rubroId?: string | null;
    orden: number;
}

export interface Subcategory {
    id: string;
    nombre: string;
    categoryId?: string | null;
    orden: number;
}
