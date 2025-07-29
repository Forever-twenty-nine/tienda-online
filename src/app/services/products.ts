// 🎉 1️⃣ Importaciones esenciales
import { inject, Injectable, signal } from '@angular/core';
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

// 🔄 1️⃣ Convertidor FirestoreDataConverter<Product>
const productConverter: FirestoreDataConverter<Product> = {
  toFirestore({ id, ...data }): DocumentData {
    // descartamos el id porque la ruta ya lo incluye
    return data;
  },
  fromFirestore(snapshot, options): Product {
    // “Prometemos” a TS que esto encaja en Omit<Product,'id'>
    const data = snapshot.data(options)! as Omit<Product, 'id'>;
    return { id: snapshot.id, ...data };
  }
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  // ⚙️ 1️⃣ Inyección de Firestore y Storage
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  // 🌟 2️⃣ Señal reactiva basada en el Observable de Firestore con manejo de errores
  products = toSignal(
    collectionData(
      collection(this.firestore, 'products').withConverter(productConverter),
      { idField: 'id' }
    ).pipe(
      catchError(error => {
        console.error('Error al cargar productos:', error);
        return of([]); // Retorna array vacío en caso de error
      })
    ) as import('rxjs').Observable<Product[]>,
    { initialValue: [] }
  );

  // ⚡ Estado de la subida de imagen
  uploading = signal(false);

  // Ya no necesitamos suscripciones manuales en el constructor
  constructor() { }

  /**
   * ➕ Agrega un nuevo producto (sin ID).
   * @param newProduct Objeto Omit<Product,'id'>; Firestore generará el ID.
   * @returns Promise<DocumentReference<Product>> con la referencia al doc creado.
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
   * ✏️ Actualiza un producto existente.
   * @param updatedProduct Producto completo con ID.
   * @returns Promise<void> al completar la actualización.
   */
  updateProduct(updatedProduct: Product): Promise<void> {
    const { id, ...rest } = updatedProduct;
    const productDoc = doc(this.firestore, 'products', id);
    return updateDoc(productDoc, rest);
  }

  /**
   * 🗑️ Elimina un producto por su ID.
   * @param id ID del producto.
   * @returns Promise<void> al completar el borrado.
   */
  deleteProduct(id: string): Promise<void> {
    const productDoc = doc(this.firestore, 'products', id);
    return deleteDoc(productDoc);
  }

  /**
   * 🚀 Sube una imagen a Storage y devuelve su URL pública.
   * @param file Archivo a subir.
   * @returns Promise<string> con la URL.
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
