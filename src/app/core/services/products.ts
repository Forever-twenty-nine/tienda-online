import { inject, Injectable, signal, effect } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { catchError, of } from 'rxjs';

/**
 * Convertidor para transformar objetos Product a/desde Firestore.
 */
const productConverter: FirestoreDataConverter<Product> = {
  toFirestore({ id, ...data }): DocumentData {
    return data;
  },
  fromFirestore(snapshot, options): Product {
    const data = snapshot.data(options)! as Omit<Product, 'id'>;
    return { id: snapshot.id, ...data };
  }
};

/**
 * Servicio para gestionar productos en Firestore y Storage.
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);


  /**
   * Bloque de señales reactivas para la gestión de productos:
   * - searchTerm: término de búsqueda de productos
   * - allProducts: todos los productos desde Firestore
   * - products: productos filtrados según búsqueda
   * - uploading: estado de carga de imagen
   */
  searchTerm = signal('');
  categoryFilter = signal<string | null>(null);
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
  products = signal<Product[]>([]);
  uploading = signal(false);

  /**
   * Inicializa el efecto reactivo para filtrar productos por búsqueda.
   */
  constructor() {
    effect(() => {
      const term = this.searchTerm().toLowerCase().trim();
      const catId = this.categoryFilter();
      const allProds = this.allProducts();
      
      let filtered = allProds;

      if (catId) {
        filtered = filtered.filter(product => product.categoriaId === catId);
      }

      if (term) {
        filtered = filtered.filter(product => 
          product.nombre.toLowerCase().includes(term) ||
          product.descripcion.toLowerCase().includes(term)
        );
      }

      this.products.set(filtered);
    });
  }

  /**
   * Actualiza el término de búsqueda.
   * @param term Término de búsqueda
   */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * Limpia el término de búsqueda.
   */
  clearSearch(): void {
    this.searchTerm.set('');
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
