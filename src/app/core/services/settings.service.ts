import { inject, Injectable, signal } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  type FirestoreDataConverter,
  type DocumentData
} from 'firebase/firestore';
import { PageContent } from '../models/settings.model';

const pageConverter: FirestoreDataConverter<PageContent> = {
  toFirestore({ id, ...data }): DocumentData { return { ...data, lastUpdated: serverTimestamp() }; },
  fromFirestore(snapshot, options): PageContent {
    const data = snapshot.data(options)! as Omit<PageContent, 'id'>;
    return { id: snapshot.id, ...data };
  }
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private firestore = inject(Firestore);

  async getPageContent(id: string): Promise<PageContent | null> {
    const docRef = doc(this.firestore, 'pages', id).withConverter(pageConverter);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }

  async savePageContent(id: string, title: string, content: string) {
    const docRef = doc(this.firestore, 'pages', id).withConverter(pageConverter);
    return await setDoc(docRef, { id, title, content, lastUpdated: null });
  }
}
