import { inject, Injectable } from '@angular/core';
import { Firestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactInfo } from '../models/contact.model';
import { catchError, of, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private firestore = inject(Firestore);
  private contactDoc = doc(this.firestore, 'settings', 'contact');

  contactInfo = toSignal(
    new Observable<ContactInfo | null>(subscriber => {
      return onSnapshot(this.contactDoc, (snapshot) => {
        subscriber.next(snapshot.exists() ? (snapshot.data() as ContactInfo) : null);
      }, error => subscriber.error(error));
    }).pipe(
      catchError(error => {
        console.error('Error al cargar información de contacto:', error);
        return of(null);
      })
    ),
    { initialValue: null }
  );

  async updateContactInfo(info: ContactInfo) {
    return await setDoc(this.contactDoc, info);
  }
}
