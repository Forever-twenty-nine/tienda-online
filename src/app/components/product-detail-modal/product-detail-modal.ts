import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe, CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, CurrencyPipe],
  templateUrl: './product-detail-modal.html',
})
export class ProductDetailModalComponent {
  @Input() product: Product | null = null;
  @Input() loading = false;
  @Input() error = false;
  @Output() close = new EventEmitter<void>();

  contactWhatsApp() {
    if (!this.product) return;
    const phoneNumber = '5492615564713';
    const message = `Hola!\n\nEstoy interesado/a en el siguiente producto de su tienda:\n\n*${this.product.nombre}*\nPrecio: ${this.product.precio.toLocaleString('es-AR', { style: 'currency', currency: 'USD' })}\n\n${this.product.descripcion}\n\nPodrian darme mas informacion sobre este producto?\n\nGracias!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}
