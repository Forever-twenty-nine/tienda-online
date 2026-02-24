import { Component, Input, Output, EventEmitter, signal, HostBinding, inject } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './product-detail-modal.html',
  animations: [
    trigger('modalState', [
      state('void', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('void => visible', [
        style({ opacity: 0 }),
        animate('400ms ease-out')
      ]),
      transition('visible => void', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalContent', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.85) translateY(-30px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'scale(1) translateY(0)'
      })),
      transition('void => visible', [
        animate('500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ]),
      transition('visible => void', [
        animate('300ms ease-in', style({ 
          opacity: 0, 
          transform: 'scale(0.95) translateY(20px)'
        }))
      ])
    ])
  ]
})
export class ProductDetailModalComponent {
  private contactService = inject(ContactService);
  @Input() set product(value: Product | null) {
    this._product = value;
    if (value) {
      const mainImage = value.imagen || (value.imagenes && value.imagenes.length > 0 ? value.imagenes[0] : null);
      this.selectedImage.set(mainImage);
    }
  }
  get product() { return this._product; }
  private _product: Product | null = null;
  
  @Input() loading = false;
  @Input() error = false;
  @Output() close = new EventEmitter<void>();
  
  selectedImage = signal<string | null>(null);

  // Estado de animación para el componente completo
  animationState = 'visible';

  selectImage(url: string) {
    this.selectedImage.set(url);
  }

  contactWhatsApp() {
    if (!this.product) return;
    const contactInfo = this.contactService.contactInfo();
    const phoneNumber = contactInfo?.whatsapp || '5492615564713';
    
    const hasDiscount = this.product.descuento && this.product.descuento > 0;
    const finalPrice = hasDiscount 
        ? this.product.precio * (1 - this.product.descuento! / 100)
        : this.product.precio;

    const priceText = hasDiscount
        ? `*${finalPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}* (Oferta ${this.product.descuento}% OFF, antes ${this.product.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })})`
        : `*${this.product.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*`;

    const message = `Hola!\n\nEstoy interesado/a en el siguiente producto de su tienda:\n\n*${this.product.nombre}*\nPrecio: ${priceText}\n\n${this.product.descripcion}\n\nPodrian darme mas informacion sobre este producto?\n\nGracias!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
  
  onCloseClick() {
    // Primero cambiamos el estado de la animación
    this.animationState = 'void';
    
    // Esperamos a que termine la animación antes de cerrar
    setTimeout(() => {
      this.close.emit();
    }, 300); // Tiempo que dura la animación de salida
  }
}
