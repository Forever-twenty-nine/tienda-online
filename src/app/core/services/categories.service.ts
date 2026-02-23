import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, writeBatch } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type FirestoreDataConverter,
  type DocumentData,
} from 'firebase/firestore';
import { Rubro, Category, Subcategory } from '../models/category.model';
import { catchError, map, of } from 'rxjs';

const rubroConverter: FirestoreDataConverter<Rubro> = {
  toFirestore({ id, ...data }): DocumentData { return data; },
  fromFirestore(snapshot, options): Rubro {
    const data = snapshot.data(options)! as Omit<Rubro, 'id'>;
    return { id: snapshot.id, ...data, orden: data.orden ?? 0 };
  }
};

const categoryConverter: FirestoreDataConverter<Category> = {
  toFirestore({ id, ...data }): DocumentData { return data; },
  fromFirestore(snapshot, options): Category {
    const data = snapshot.data(options)! as Omit<Category, 'id'>;
    return { id: snapshot.id, ...data, orden: data.orden ?? 0 };
  }
};

const subcategoryConverter: FirestoreDataConverter<Subcategory> = {
  toFirestore({ id, ...data }): DocumentData { return data; },
  fromFirestore(snapshot, options): Subcategory {
    const data = snapshot.data(options)! as Omit<Subcategory, 'id'>;
    return { id: snapshot.id, ...data, orden: data.orden ?? 0 };
  }
};

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private firestore = inject(Firestore);

  rubros = toSignal(
    collectionData(collection(this.firestore, 'rubros').withConverter(rubroConverter), { idField: 'id' }).pipe(
      map(items => items.sort((a, b) => a.orden - b.orden)),
      catchError(() => of([]))
    ), { initialValue: [] }
  );

  categories = toSignal(
    collectionData(collection(this.firestore, 'categories').withConverter(categoryConverter), { idField: 'id' }).pipe(
      map(items => items.sort((a, b) => a.orden - b.orden)),
      catchError(() => of([]))
    ), { initialValue: [] }
  );

  subcategories = toSignal(
    collectionData(collection(this.firestore, 'subcategories').withConverter(subcategoryConverter), { idField: 'id' }).pipe(
      map(items => items.sort((a, b) => a.orden - b.orden)),
      catchError(() => of([]))
    ), { initialValue: [] }
  );

  // Rubros CRUD
  async addRubro(nombre: string) {
    return await addDoc(collection(this.firestore, 'rubros'), { nombre, orden: this.rubros().length });
  }
  async updateRubro(id: string, nombre: string) {
    return await updateDoc(doc(this.firestore, 'rubros', id), { nombre });
  }
  async deleteRubro(id: string) {
    return await deleteDoc(doc(this.firestore, 'rubros', id));
  }
  async reorderRubros(items: Rubro[]) {
    const batch = writeBatch(this.firestore);
    items.forEach((item, index) => batch.update(doc(this.firestore, 'rubros', item.id), { orden: index }));
    return await batch.commit();
  }

  // Categories CRUD
  async addCategory(nombre: string, rubroId?: string | null) {
    const data: any = { nombre, orden: this.categories().length };
    if (rubroId) data.rubroId = rubroId;
    return await addDoc(collection(this.firestore, 'categories'), data);
  }
  async updateCategory(id: string, nombre: string, rubroId?: string | null) {
    return await updateDoc(doc(this.firestore, 'categories', id), { nombre, rubroId: rubroId || null });
  }
  async deleteCategory(id: string) {
    return await deleteDoc(doc(this.firestore, 'categories', id));
  }
  async reorderCategories(items: Category[]) {
    const batch = writeBatch(this.firestore);
    items.forEach((item, index) => batch.update(doc(this.firestore, 'categories', item.id), { orden: index }));
    return await batch.commit();
  }

  // Subcategories CRUD
  async addSubcategory(nombre: string, categoryId?: string | null) {
    const data: any = { nombre, orden: this.subcategories().length };
    if (categoryId) data.categoryId = categoryId;
    return await addDoc(collection(this.firestore, 'subcategories'), data);
  }
  async updateSubcategory(id: string, nombre: string, categoryId?: string | null) {
    return await updateDoc(doc(this.firestore, 'subcategories', id), { nombre, categoryId: categoryId || null });
  }
  async deleteSubcategory(id: string) {
    return await deleteDoc(doc(this.firestore, 'subcategories', id));
  }
  async reorderSubcategories(items: Subcategory[]) {
    const batch = writeBatch(this.firestore);
    items.forEach((item, index) => batch.update(doc(this.firestore, 'subcategories', item.id), { orden: index }));
    return await batch.commit();
  }

  getCategoryPath(categoryId: string): string {
    const cat = this.categories().find(c => c.id === categoryId);
    if (!cat) return '';
    const rubro = this.rubros().find(r => r.id === cat.rubroId);
    return rubro ? `${rubro.nombre} > ${cat.nombre}` : cat.nombre;
  }

  getSubcategoryPath(subId: string): string {
    const sub = this.subcategories().find(s => s.id === subId);
    if (!sub) return '';
    const catPath = sub.categoryId ? this.getCategoryPath(sub.categoryId) : '';
    return catPath ? `${catPath} > ${sub.nombre}` : sub.nombre;
  }
}

