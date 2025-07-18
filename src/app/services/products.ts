// 🎉 1️⃣ Importaciones esenciales
import { Injectable, signal } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { type FirestoreDataConverter, type DocumentData, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Product } from '../models/product.model';

// 🔄 1️⃣ Convertidor FirestoreDataConverter<Product>
const productConverter: FirestoreDataConverter<Product> = {
  toFirestore({ id, ...data }): DocumentData {
    // descartamos el id porque la ruta ya lo incluye
    return data;
  },
  fromFirestore(snap, opts): Product {
    // 🎯 “Prometemos” a TS que esto encaja en Omit<Product,'id'>
    const data = snap.data(opts)! as Omit<Product, 'id'>;

    // 🚀 Ahora podemos hacer spread y TS reconoce las propiedades
    return {
      id: snap.id,
      ...data
    };
  }
};
// ✨ 2️⃣ Servicio con señal reactiva
@Injectable({ providedIn: 'root' })
export class ProductsService {
  // 🗑 Implementa delete() para borrar productos
  delete(id: string) {
    const ref = doc(this.firestore, 'products', id);
    deleteDoc(ref);
  }

  // 📦 señal fuertemente tipeada
  products = signal<Product[]>([]);

  // ⚙️ 2️⃣ Inyectamos Firestore
  constructor(private firestore: Firestore) {
    this.loadProducts();
  }
  // ⚙️ 3️⃣ Carga y escucha la colección tipada
  private loadProducts() {
    const ref = collection(this.firestore, 'products')
      .withConverter(productConverter);

    collectionData(ref, { idField: 'id' })
      .subscribe((prods: Product[]) => {
        this.products.set(prods);
      });
  }
  // 🆕 4️⃣ Agregar un nuevo producto
  addProduct(data: { id: string; }) {
    const ref = collection(this.firestore, 'products').withConverter(productConverter);
    addDoc(ref, data);
  }
  // ✏️ 5️⃣ Actualizar un producto existente
  updateProduct(data: { id: string; }) {
    const ref = doc(this.firestore, 'products', data.id).withConverter(productConverter);
    updateDoc(ref, data);
  }
}
