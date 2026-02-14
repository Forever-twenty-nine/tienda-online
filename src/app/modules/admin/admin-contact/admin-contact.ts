import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ContactInfo } from '../../../core/models/contact.model';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialog],
  templateUrl: './admin-contact.html',
})
export class AdminContact {
  private contactService = inject(ContactService);
  
  contactData: ContactInfo = {
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    instagram: '',
    facebook: '',
    twitter: ''
  };

  loading = true;
  showSuccessModal = signal(false);

  constructor() {
    effect(() => {
      const info = this.contactService.contactInfo();
      if (info) {
        this.contactData = { ...info };
        this.loading = false;
      }
    });
  }

  async onSubmit() {
    try {
      await this.contactService.updateContactInfo(this.contactData);
      this.showSuccessModal.set(true);
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Hubo un error al actualizar la información');
    }
  }
}
