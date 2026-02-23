import { inject, Injectable, signal, computed } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoriesService } from './categories.service';
import {
  type FirestoreDataConverter,
  type DocumentData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  type DocumentReference
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { Product } from '../models/product.model';
import { catchError, of, map } from 'rxjs';

/**
 * Genera un slug amigable para URL a partir de un texto.
 */
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .replace(/[^a-z0-9 -]/g, '') // Elimina caracteres no permitidos
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .replace(/-+/g, '-') // Elimina guiones repetidos
    .trim();
}

/**
 * Convertidor para transformar objetos Product a/desde Firestore.
 */
const productConverter: FirestoreDataConverter<Product> = {
  toFirestore({ id, slug, ...data }): DocumentData {
    return data;
  },
  fromFirestore(snapshot, options): Product {
    const data = snapshot.data(options)! as Omit<Product, 'id'>;
    return { 
      id: snapshot.id, 
      ...data,
      descuento: data.descuento ?? 0,
      disponibilidad: data.disponibilidad ?? true,
      publicado: data.publicado ?? true,
      slug: createSlug(data.nombre)
    };
  }
};

/**
 * Servicio para gestionar productos en Firestore y Storage.
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private categoriesService = inject(CategoriesService);


  /**
   * Bloque de señales reactivas para la gestión de productos:
   * - searchTerm: término de búsqueda de productos
   * - allProducts: todos los productos desde Firestore
   * - products: productos filtrados según búsqueda
   * - uploading: estado de carga de imagen
   */
  searchTerm = signal('');
  rubroFilter = signal<string | null>(null);
  categoryFilter = signal<string | null>(null);
  subcategoryFilter = signal<string | null>(null);
  featuredFilter = signal<boolean | null>(null);
  publishedFilter = signal<boolean | null>(null);
  stockFilter = signal<boolean | null>(null);
  discountFilter = signal<boolean | null>(null);

  // 📄 Paginación / Scroll Infinito
  private readonly itemsPerPage = 8;
  visibleCount = signal(this.itemsPerPage);

  allProducts = toSignal(
    collectionData(
      collection(this.firestore, 'products').withConverter(productConverter),
      { idField: 'id' }
    ).pipe(
      catchError(error => {
        console.error('Error al cargar productos:', error);
        return of([]);
      })
    ) as import('rxjs').Observable<Product[]>,
    { initialValue: [] }
  );

  private matchesTaxonomy(product: Product): boolean {
    const rubroId = this.rubroFilter();
    const catId = this.categoryFilter();
    const subId = this.subcategoryFilter();

    // Si hay filtro de subcategoría, debe coincidir exactamente
    if (subId) return product.subcategoriaId === subId;
    
    // Si hay filtro de categoría, el producto debe estar en esa categoría o sus subcategorías
    if (catId) {
      if (product.categoriaId === catId) return true;
      // También coincide si el producto está en una subcategoría que pertenece a esta categoría
      if (product.subcategoriaId) {
        const sub = this.categoriesService.subcategories().find(s => s.id === product.subcategoriaId);
        if (sub && sub.categoryId === catId) return true;
      }
      return false;
    }

    // Si hay filtro de rubro, el producto debe estar en ese rubro o sus categorías/subcategorías
    if (rubroId) {
      if (product.rubroId === rubroId) return true;
      
      if (product.categoriaId) {
        const cat = this.categoriesService.categories().find(c => c.id === product.categoriaId);
        if (cat && cat.rubroId === rubroId) return true;
      }
      
      if (product.subcategoriaId) {
        const sub = this.categoriesService.subcategories().find(s => s.id === product.subcategoriaId);
        if (sub && sub.categoryId) {
          const cat = this.categoriesService.categories().find(c => c.id === sub.categoryId);
          if (cat && cat.rubroId === rubroId) return true;
        }
      }
      return false;
    }

    return true; // No hay filtros
  }

  /**
   * Productos filtrados para la parte pública (solo publicados).
   */
  products = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allProds = this.allProducts();

    return allProds.filter(product => {
      const matchesCategory = this.matchesTaxonomy(product);
      const matchesTerm = !term ||
        product.nombre.toLowerCase().includes(term) ||
        product.descripcion.toLowerCase().includes(term);
      const isPublished = product.publicado !== false;

      return matchesCategory && matchesTerm && isPublished;
    });
  });

  /**
   * Productos filtrados para el panel de administración (incluye no publicados).
   */
  adminProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const featured = this.featuredFilter();
    const published = this.publishedFilter();
    const stock = this.stockFilter();
    const discount = this.discountFilter();
    const allProds = this.allProducts();

    return allProds.filter(product => {
      const matchesCategory = this.matchesTaxonomy(product);
      const matchesTerm = !term ||
        product.nombre.toLowerCase().includes(term) ||
        product.descripcion.toLowerCase().includes(term);
      const matchesFeatured = featured === null || product.destacado === featured;
      const matchesPublished = published === null || product.publicado === published;
      const matchesStock = stock === null || product.disponibilidad === stock;
      const matchesDiscount = discount === null || (discount ? (product.descuento ?? 0) > 0 : (product.descuento ?? 0) === 0);

      return matchesCategory && matchesTerm && matchesFeatured && matchesPublished && matchesStock && matchesDiscount;
    });
  });

  uploading = signal(false);

  /**
   * Productos visibles (paginados) para la parte pública y admin.
   */
  displayedProducts = computed(() => {
    return this.products().slice(0, this.visibleCount());
  });

  displayedAdminProducts = computed(() => {
    return this.adminProducts().slice(0, this.visibleCount());
  });

  hasMore = computed(() => {
    // Verifica si hay más en el contexto actual (público o admin)
    // Usamos el máximo de ambos para simplificar el servicio
    const total = Math.max(this.products().length, this.adminProducts().length);
    return this.visibleCount() < total;
  });

  loadMore() {
    this.visibleCount.update(v => v + this.itemsPerPage);
  }

  resetPagination() {
    this.visibleCount.set(this.itemsPerPage);
  }

  /**
   * Inicializa el servicio.
   */
  constructor() {}

  /**
   * Actualiza el término de búsqueda.
   * @param term Término de búsqueda
   */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    this.resetPagination();
  }

  /**
   * Limpia el término de búsqueda.
   */
  clearSearch(): void {
    this.searchTerm.set('');
    this.resetPagination();
  }

  setRubro(id: string | null): void {
    this.rubroFilter.set(id);
    this.categoryFilter.set(null);
    this.subcategoryFilter.set(null);
    this.resetPagination();
  }

  setCategory(catId: string | null): void {
    this.categoryFilter.set(catId);
    this.subcategoryFilter.set(null);
    this.resetPagination();
  }

  setSubcategory(subId: string | null): void {
    this.subcategoryFilter.set(subId);
    this.resetPagination();
  }

  clearFilters(): void {
    this.rubroFilter.set(null);
    this.categoryFilter.set(null);
    this.subcategoryFilter.set(null);
    this.resetPagination();
  }

  setFeatured(featured: boolean | null): void {
    this.featuredFilter.set(featured);
    this.resetPagination();
  }

  setPublished(published: boolean | null): void {
    this.publishedFilter.set(published);
    this.resetPagination();
  }

  setStock(stock: boolean | null): void {
    this.stockFilter.set(stock);
    this.resetPagination();
  }

  setDiscount(discount: boolean | null): void {
    this.discountFilter.set(discount);
    this.resetPagination();
  }

  /**
   * Agrega un nuevo producto a Firestore.
   * @param newProduct Producto sin id
   * @returns Referencia al documento creado
   */
  async addProduct(newProduct: Omit<Product, 'id'>): Promise<DocumentReference<any>> {
    try {
      const productsColl = collection(this.firestore, 'products')
        .withConverter(productConverter);
      return await addDoc(productsColl, newProduct);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      throw error;
    }
  }

  /**
   * Actualiza un producto existente en Firestore.
   * @param updatedProduct Producto con id
   * @returns Promesa de actualización
   */
  updateProduct(updatedProduct: Product): Promise<void> {
    const { id, ...rest } = updatedProduct;
    const productDoc = doc(this.firestore, 'products', id);
    return updateDoc(productDoc, rest);
  }

  /**
   * Elimina un producto de Firestore por id.
   * @param id Id del producto
   * @returns Promesa de borrado
   */
  deleteProduct(id: string): Promise<void> {
    const productDoc = doc(this.firestore, 'products', id);
    return deleteDoc(productDoc);
  }

  /**
   * Sube una imagen a Storage y retorna su URL pública.
   * @param file Archivo a subir
   * @returns URL pública de la imagen
   */
  async uploadImage(file: File): Promise<string> {
    this.uploading.set(true);
    try {
      const path = `products/${Date.now()}_${file.name}`;
      const fileRef = storageRef(this.storage, path);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    } finally {
      this.uploading.set(false);
    }
  }
}
