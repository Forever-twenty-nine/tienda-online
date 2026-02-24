import { inject, Injectable, signal, DestroyRef } from '@angular/core';
import { Firestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ContactInfo } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private contactDoc = doc(this.firestore, 'settings', 'contact');

  private contactInfoSignal = signal<ContactInfo | null>(null);
  contactInfo = this.contactInfoSignal.asReadonly();

  constructor() {
    const unsubscribe = onSnapshot(this.contactDoc, (snapshot) => {
      this.contactInfoSignal.set(snapshot.exists() ? (snapshot.data() as ContactInfo) : null);
    }, error => {
      console.error('Error al cargar información de contacto:', error);
    });

    this.destroyRef.onDestroy(() => unsubscribe());
  }

  async updateContactInfo(info: ContactInfo) {
    return await setDoc(this.contactDoc, info);
  }
}
