import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  type FirestoreDataConverter,
  type DocumentData,
} from 'firebase/firestore';
import { Category } from '../models/category.model';
import { catchError, of } from 'rxjs';

const categoryConverter: FirestoreDataConverter<Category> = {
  toFirestore({ id, ...data }): DocumentData {
    return data;
  },
  fromFirestore(snapshot, options): Category {
    const data = snapshot.data(options)! as Omit<Category, 'id'>;
    return { id: snapshot.id, ...data };
  }
};

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private firestore = inject(Firestore);

  categories = toSignal(
    collectionData(
      collection(this.firestore, 'categories').withConverter(categoryConverter),
      { idField: 'id' }
    ).pipe(
      catchError(error => {
        console.error('Error al cargar categorías:', error);
        return of([]);
      })
    ) as import('rxjs').Observable<Category[]>,
    { initialValue: [] }
  );

  async addCategory(name: string) {
    const categoriesColl = collection(this.firestore, 'categories');
    return await addDoc(categoriesColl, { nombre: name });
  }

  async updateCategory(id: string, name: string) {
    const categoryDoc = doc(this.firestore, 'categories', id);
    return await updateDoc(categoryDoc, { nombre: name });
  }

  async deleteCategory(id: string) {
    const categoryDoc = doc(this.firestore, 'categories', id);
    return await deleteDoc(categoryDoc);
  }
}
