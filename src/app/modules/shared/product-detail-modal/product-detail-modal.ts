import { Component, Input, Output, EventEmitter, signal, HostBinding } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe, CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { trigger, style, animate, transition, state } from '@angular/animations';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, CurrencyPipe],
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
  @Input() product: Product | null = null;
  @Input() loading = false;
  @Input() error = false;
  @Output() close = new EventEmitter<void>();
  
  // Estado de animación para el componente completo
  animationState = 'visible';

  contactWhatsApp() {
    if (!this.product) return;
    const phoneNumber = '5492615564713';
    const message = `Hola!\n\nEstoy interesado/a en el siguiente producto de su tienda:\n\n*${this.product.nombre}*\nPrecio: ${this.product.precio.toLocaleString('es-AR', { style: 'currency', currency: 'USD' })}\n\n${this.product.descripcion}\n\nPodrian darme mas informacion sobre este producto?\n\nGracias!`;
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
