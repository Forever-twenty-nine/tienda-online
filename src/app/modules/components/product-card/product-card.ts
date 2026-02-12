import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { Product } from '../../../core/models/product.model';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-product-card',
  imports: [NgOptimizedImage, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('hoverAnimation', [
      state('initial', style({
        transform: 'scale(1)',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      })),
      state('hovered', style({
        transform: 'scale(1.03)',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      })),
      transition('initial <=> hovered', [
        animate('200ms ease-in-out')
      ])
    ])
  ]
})
export class ProductCard {
  @Input() product!: Product;
  @Output() openDetail = new EventEmitter<Product>();
  hoverState = 'initial'; // Estado para la animación de hover

  emitOpenDetail() {
    this.openDetail.emit(this.product);
  }
}