import { inject, Injectable } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactInfo } from '../models/contact.model';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private firestore = inject(Firestore);
  private contactDoc = doc(this.firestore, 'settings', 'contact');

  contactInfo = toSignal(
    docData(this.contactDoc).pipe(
      catchError(error => {
        console.error('Error al cargar información de contacto:', error);
        return of(null);
      })
    ) as import('rxjs').Observable<ContactInfo | null>,
    { initialValue: null }
  );

  async updateContactInfo(info: ContactInfo) {
    return await setDoc(this.contactDoc, info);
  }
}
