import { Component, input, output, signal, effect, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './product-detail-modal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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

  product = input<Product | null>(null);
  loading = input(false);
  error = input(false);
  close = output<void>();

  selectedImage = signal<string | null>(null);

  // Estado de animación para el componente completo
  animationState = 'visible';

  constructor() {
    effect(() => {
      const value = this.product();
      if (value) {
        const mainImage = value.imagen || (value.imagenes && value.imagenes.length > 0 ? value.imagenes[0] : null);
        this.selectedImage.set(mainImage);
      }
    });
  }

  selectImage(url: string) {
    this.selectedImage.set(url);
  }

  contactWhatsApp() {
    const product = this.product();
    if (!product) return;
    const contactInfo = this.contactService.contactInfo();
    const phoneNumber = contactInfo?.whatsapp || '5492615564713';

    const hasDiscount = product.descuento && product.descuento > 0;
    const finalPrice = hasDiscount
        ? product.precio * (1 - product.descuento! / 100)
        : product.precio;

    const priceText = hasDiscount
        ? `*${finalPrice.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}* (Oferta ${product.descuento}% OFF, antes ${product.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })})`
        : `*${product.precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}*`;

    const message = `Hola!\n\nEstoy interesado/a en el siguiente producto de su tienda:\n\n*${product.nombre}*\nPrecio: ${priceText}\n\n${product.descripcion}\n\nPodrian darme mas informacion sobre este producto?\n\nGracias!`;
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
